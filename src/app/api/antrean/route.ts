import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { ANTREAN_SELECT, ANTREAN_PUBLIC_SELECT, canViewIdentity } from "@/lib/antrean-select";
import { toClientErrorMessage } from "@/lib/client-error";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const tanggal = searchParams.get("tanggal");
    const layananId = searchParams.get("layananId");
    const layananKode = searchParams.get("layananKode");
    const status = searchParams.get("status");
    const id = searchParams.get("id");

    if (id) {
      // The ticket page is public by design (the QR in the email is the whole point), so an
      // anonymous caller still gets the record — but only the PUBLIC projection. Identity
      // (name / NIK / email) is released only to the ticket's owner or an ADMIN. Previously any
      // holder of a ticket cuid could read a citizen's NIK and email (2026-09-28 audit).
      const viewer = {
        id: ((session?.user as any)?.id as string | undefined) ?? null,
        role: ((session?.user as any)?.role as string | undefined) ?? null,
      };
      const item = await prisma.antrean.findUnique({
        where: { id },
        select: { ...ANTREAN_PUBLIC_SELECT, userId: true, wargaId: true },
      });
      if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

      if (!canViewIdentity(item, viewer)) {
        const { userId: _u, wargaId: _w, ...pub } = item;
        return NextResponse.json(pub);
      }

      const full = await prisma.antrean.findUnique({
        where: { id },
        // Explicit field list (see lib/antrean-select.ts): `include: { user: true }` would also
        // serialise User.password, publishing every citizen's bcrypt hash to the public.
        select: ANTREAN_SELECT,
      });
      return NextResponse.json(full);
    }

    const where: any = {};

    const role = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;

    // The public TV display legitimately reads the whole queue by date/status, but it only ever
    // needs numbers — never identities. So identity is gated on the VIEWER, not on the query
    // shape: a WARGA is always confined to their own rows, an ADMIN sees everything, and an
    // anonymous caller gets the public projection for every row. Previously adding `?status=`
    // to the URL was enough to drop the userId filter and read every citizen's name and NIK
    // (2026-09-28 audit).
    const viewer = { id: (userId as string | undefined) ?? null, role: (role as string | undefined) ?? null };
    const maySeeIdentity = viewer.role === "ADMIN";
    const isOwnScope = viewer.role === "WARGA" && !!viewer.id;

    if (isOwnScope) {
      where.userId = viewer.id;
    }

    if (tanggal) {
      const d = new Date(tanggal);
      d.setUTCHours(0, 0, 0, 0);
      const d2 = new Date(d);
      d2.setUTCDate(d2.getUTCDate() + 1);
      where.tanggal = { gte: d, lt: d2 };
    }
    if (layananId) where.layananId = layananId;
    if (layananKode) {
      const layanan = await prisma.layanan.findUnique({ where: { kode: layananKode as any } });
      if (layanan) where.layananId = layanan.id;
      else return NextResponse.json({ antrean: [] });
    }
    if (status) where.status = status;

    // Explicit field list, never `include: { user: true }` — see lib/antrean-select.ts.
    const antrean = await prisma.antrean.findMany({
      where,
      select: maySeeIdentity ? ANTREAN_SELECT : ANTREAN_PUBLIC_SELECT,
      orderBy: [{ tanggal: "asc" }, { nomor: "asc" }],
      take: 200,
    });
    return NextResponse.json({ antrean });
  } catch (e: any) {
    // Log the real failure server-side; return a generic text so Prisma/Node internals, schema
    // names and server paths are not echoed to the caller (lib/client-error.ts).
    console.error("GET /api/antrean error", e);
    return NextResponse.json({ error: toClientErrorMessage(e) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: "Admin only" }, { status: 403 });
    const { id, action } = await req.json() as { id?: string; action?: string };
    if (!id || !action) return NextResponse.json({ error: "id dan action wajib" }, { status: 400 });

    const map: Record<string, any> = {
      PANGGIL: { status: "DIPANGGIL", waktuPanggil: new Date() },
      SELESAI: { status: "SELESAI", waktuSelesai: new Date() },
      LEWATI: { status: "LEWATI", waktuLewati: new Date() },
      BATAL: { status: "BATAL" },
    };
    const data = map[action.toUpperCase()];
    if (!data) return NextResponse.json({ error: "action harus PANGGIL/SELESAI/LEWATI/BATAL" }, { status: 400 });

    const updated = await prisma.antrean.update({
      where: { id },
      data,
      select: ANTREAN_SELECT,
    });
    return NextResponse.json(updated);
  } catch (e: any) {
    console.error("PATCH /api/antrean error", e);
    return NextResponse.json({ error: toClientErrorMessage(e) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) return NextResponse.json({ error: "Wajib login." }, { status: 401 });

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id wajib diisi." }, { status: 400 });

    const ticket = await prisma.antrean.findUnique({
      where: { id },
      select: { id: true, userId: true, status: true, tanggal: true, layananId: true },
    });
    if (!ticket || ticket.userId !== userId) return NextResponse.json({ error: "Tiket tidak ditemukan." }, { status: 404 });
    if (ticket.status !== "MENUNGGU") return NextResponse.json({ error: "Tiket hanya dapat dibatalkan saat masih MENUNGGU." }, { status: 409 });

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.antrean.update({ where: { id }, data: { status: "BATAL" }, select: { id: true, status: true } });
      await tx.kuotaHarian.updateMany({ where: { layananId: ticket.layananId, tanggal: ticket.tanggal, terisi: { gt: 0 } }, data: { terisi: { decrement: 1 } } });
      return result;
    });
    return NextResponse.json(updated);
  } catch (e: unknown) {
    console.error("DELETE /api/antrean error", e);
    return NextResponse.json({ error: toClientErrorMessage(e) }, { status: 500 });
  }
}
