import { NextResponse } from "next/server";
import prisma from "@/lib/db";

/**
 * GET /api/kuota?layananKode=KTP&tanggal=YYYY-MM-DD
 *
 * Live quota for the booking form. No auth — the numbers are public policy facts
 * (Disdukcapil publishes a daily cap of 80 per service), and knowing them does not
 * disclose anyone's PII. The booking endpoint re-checks the cap server-side anyway.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const kode = url.searchParams.get("layananKode")?.trim();
    const tanggal = url.searchParams.get("tanggal")?.trim();
    if (!kode || !tanggal) {
      return NextResponse.json({ error: "layananKode dan tanggal wajib diisi." }, { status: 400 });
    }

    const layanan = await prisma.layanan.findUnique({ where: { kode: kode as any } });
    if (!layanan) return NextResponse.json({ error: "Layanan tidak ditemukan." }, { status: 404 });

    const tgl = new Date(tanggal);
    if (isNaN(tgl.getTime())) return NextResponse.json({ error: "Format tanggal tidak valid." }, { status: 400 });
    tgl.setUTCHours(0, 0, 0, 0);

    const kuota = await prisma.kuotaHarian.findUnique({
      where: { layananId_tanggal: { layananId: layanan.id, tanggal: tgl } },
    });

    // No row yet = no bookings for that day. Treat it as the default 80-cap, fully available.
    const jumlah = kuota?.jumlah ?? 80;
    const terisi = kuota?.terisi ?? 0;

    // KuotaHarian docs: `jumlah`: cap for this layanan+day, `terisi`: already booked.
    return NextResponse.json({
      layananKode: layanan.kode,
      tanggal: tgl.toISOString().slice(0, 10),
      jumlah,
      terisi,
      sisa: Math.max(0, jumlah - terisi),
      penuh: terisi >= jumlah,
    });
  } catch (e: unknown) {
    console.error("GET /api/kuota error", e);
    return NextResponse.json({ error: "Terjadi kesalahan." }, { status: 500 });
  }
}
