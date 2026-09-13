import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendBookingEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nik, nama, email, layananKode, tanggal } = body as {
      nik?: string;
      nama?: string;
      email?: string;
      layananKode?: string;
      tanggal?: string;
    };

    if (!nik || !nama || !layananKode || !tanggal) {
      return NextResponse.json({ error: "nik, nama, layananKode, tanggal wajib diisi" }, { status: 400 });
    }
    if (nik.length !== 16 || !/^\d+$/.test(nik)) {
      return NextResponse.json({ error: "NIK harus 16 digit angka" }, { status: 400 });
    }

    const layanan = await prisma.layanan.findUnique({ where: { kode: layananKode as any } });
    if (!layanan) return NextResponse.json({ error: "Layanan tidak ditemukan" }, { status: 404 });

    // normalize tanggal to start of day UTC
    const tgl = new Date(tanggal);
    if (isNaN(tgl.getTime())) return NextResponse.json({ error: "Format tanggal tidak valid" }, { status: 400 });
    tgl.setUTCHours(0, 0, 0, 0);

    // findOrCreate Warga
    let warga = await prisma.warga.findUnique({ where: { nik } });
    if (!warga) {
      warga = await prisma.warga.create({ data: { nik, nama, email: email || null } });
    } else {
      // update nama/email if changed
      if (warga.nama !== nama || warga.email !== (email || null)) {
        warga = await prisma.warga.update({ where: { id: warga.id }, data: { nama, email: email || null } });
      }
    }

    // Kuota check / create
    let kuota = await prisma.kuotaHarian.findUnique({
      where: { layananId_tanggal: { layananId: layanan.id, tanggal: tgl } },
    });
    if (!kuota) {
      kuota = await prisma.kuotaHarian.create({
        data: { layananId: layanan.id, tanggal: tgl, jumlah: 80, terisi: 0 },
      });
    }
    if (kuota.terisi >= kuota.jumlah) {
      return NextResponse.json({ error: "Kuota harian penuh, silakan pilih tanggal lain" }, { status: 409 });
    }

    // generate nomor = max+1 for that layanan+tanggal
    const last = await prisma.antrean.findFirst({
      where: { layananId: layanan.id, tanggal: tgl },
      orderBy: { nomor: "desc" },
      select: { nomor: true },
    });
    const nomor = (last?.nomor ?? 0) + 1;

    const antrean = await prisma.antrean.create({
      data: {
        nomor,
        tanggal: tgl,
        status: "MENUNGGU",
        wargaId: warga.id,
        layananId: layanan.id,
      },
    });

    await prisma.kuotaHarian.update({ where: { id: kuota.id }, data: { terisi: { increment: 1 } } });

    // non-blocking email
    if (email) {
      sendBookingEmail(email, {
        nomor,
        layanan: layanan.nama,
        tanggal: tgl.toISOString().slice(0, 10),
        id: antrean.id,
      }).catch((e) => console.error("Email failed:", e));
    }

    return NextResponse.json({ id: antrean.id, nomor }, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/booking error", e);
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}
