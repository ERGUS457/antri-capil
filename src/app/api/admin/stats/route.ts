/**
 * Statistik untuk kepala dinas.
 *
 * Ringkasan harian: total antrean, terlayani, dibatalkan,
 * dan waktu rata-rata antrean per layanan.
 *
 * Endpoint ini hanya bisa diakses oleh ADMIN. Data diambil dari
 * antrean hari ini berdasarkan parameter `tanggal` (default: hari ini).
 */
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { toClientErrorMessage } from "@/lib/client-error";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Hanya ADMIN yang dapat mengakses statistik." },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const tanggal = url.searchParams.get("tanggal")
      ? new Date(url.searchParams.get("tanggal")!)
      : new Date();
    tanggal.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(tanggal);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const [total, byStatus, byLayanan, layananList, selesaiList] = await Promise.all([
      prisma.antrean.count({ where: { tanggal: { gte: tanggal, lt: tomorrow } } }),
      prisma.antrean.groupBy({
        by: ["status"],
        where: { tanggal: { gte: tanggal, lt: tomorrow } },
        _count: { id: true },
      }),
      prisma.antrean.groupBy({
        by: ["layananId"],
        where: { tanggal: { gte: tanggal, lt: tomorrow } },
        _count: { id: true },
      }),
      prisma.layanan.findMany({ select: { id: true, kode: true, nama: true } }),
      prisma.antrean.findMany({
        where: { tanggal: { gte: tanggal, lt: tomorrow }, status: "SELESAI", waktuSelesai: { not: null } },
        select: { id: true, layananId: true, waktuPanggil: true, waktuSelesai: true },
      }),
    ]);

    const layananMap = new Map(layananList.map((l) => [l.id, l]));
    const layananRows = byLayanan.map((l) => ({
      kode: layananMap.get(l.layananId)?.kode ?? l.layananId,
      nama: layananMap.get(l.layananId)?.nama ?? "Layanan",
      total: l._count.id,
    }));

    // Rata-rata menit tunggu: hitung per antrean yang selesai.
    const menitTunggu = selesaiList
      .map((a) => {
        if (!a.waktuPanggil || !a.waktuSelesai) return null;
        const ms = a.waktuSelesai.getTime() - a.waktuPanggil.getTime();
        return Math.round(ms / 60000);
      })
      .filter((m): m is number => m !== null);
    const avgMenit =
      menitTunggu.length > 0
        ? Math.round(menitTunggu.reduce((a, b) => a + b, 0) / menitTunggu.length)
        : null;

    // Status counts → objek lengkap dengan 0 untuk status yang tidak muncul.
    const statusMap: Record<string, number> = {
      MENUNGGU: 0,
      DIPANGGIL: 0,
      SELESAI: 0,
      LEWATI: 0,
      BATAL: 0,
    };
    for (const s of byStatus) {
      statusMap[s.status] = s._count.id;
    }

    return NextResponse.json({
      tanggal: tanggal.toISOString().slice(0, 10),
      total,
      status: statusMap,
      rataRataTungguMenit: avgMenit,
      layanan: layananRows,
    });
  } catch (e: unknown) {
    console.error("GET /api/admin/stats error", e);
    return NextResponse.json({ error: "Terjadi kesalahan." }, { status: 500 });
  }
}
