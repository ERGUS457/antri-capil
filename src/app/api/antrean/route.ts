import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

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
      const item = await prisma.antrean.findUnique({
        where: { id },
        include: { warga: true, layanan: true, user: true },
      });
      if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
      // Security: only owner or admin can see full ticket details?
      if (item.userId && item.userId !== (session?.user as any)?.id && (session?.user as any)?.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      return NextResponse.json(item);
    }

    const where: any = {};
    // restrict view by user if not admin
    if ((session?.user as any)?.role !== 'ADMIN') {
      where.userId = (session?.user as any)?.id;
    }

    if (tanggal) {
      const d = new Date(tanggal);
      d.setUTCHours(0, 0, 0, 0);
      where.tanggal = d;
    }
    if (layananId) where.layananId = layananId;
    if (layananKode) {
      const layanan = await prisma.layanan.findUnique({ where: { kode: layananKode as any } });
      if (layanan) where.layananId = layanan.id;
      else return NextResponse.json({ antrean: [] });
    }
    if (status) where.status = status;

    const antrean = await prisma.antrean.findMany({
      where,
      include: { warga: true, layanan: true },
      orderBy: [{ tanggal: "asc" }, { nomor: "asc" }],
      take: 200,
    });
    return NextResponse.json({ antrean });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
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
      LEWATI: { status: "LEWATI" },
      BATAL: { status: "BATAL" },
    };
    const data = map[action.toUpperCase()];
    if (!data) return NextResponse.json({ error: "action harus PANGGIL/SELESAI/LEWATI/BATAL" }, { status: 400 });

    const updated = await prisma.antrean.update({ where: { id }, data, include: { warga: true, layanan: true } });
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
