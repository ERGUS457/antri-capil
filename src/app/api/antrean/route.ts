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
      // tiket publik boleh dilihat siapa saja via ID (QR), tapi batasi data sensitif jika perlu
      return NextResponse.json(item);
    }

    const where: any = {};

    // Hanya batasi ke userId jika request dari WARGA yang login DAN tanpa filter tanggal/status publik
    // Untuk display publik (tanpa session) atau admin, tampilkan semua
    const role = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;
    // Jika WARGA login dan akses /dashboard (tanpa tanggal) -> filter miliknya
    // Jika ada param tanggal+status (admin/display) -> jangan filter by user
    const isPublicDisplay = !session;
    const isFilteredQuery = tanggal || status || layananId || layananKode;

    if (role === "WARGA" && userId && !isFilteredQuery) {
      where.userId = userId;
    }
    // Admin & public display: no userId filter

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

    const antrean = await prisma.antrean.findMany({
      where,
      include: { warga: true, layanan: true, user: true },
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

    const updated = await prisma.antrean.update({ where: { id }, data, include: { warga: true, layanan: true, user: true } });
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
