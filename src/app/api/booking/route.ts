import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { sendBookingEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const { layananKode, tanggal } = body as {
      layananKode?: string;
      tanggal?: string;
      nik?: string;
      nama?: string;
      email?: string;
    };

    if (!layananKode || !tanggal) {
      return NextResponse.json({ error: "layananKode, tanggal wajib diisi" }, { status: 400 });
    }

    const layanan = await prisma.layanan.findUnique({ where: { kode: layananKode as any } });
    if (!layanan) return NextResponse.json({ error: "Layanan tidak ditemukan" }, { status: 404 });

    const tgl = new Date(tanggal);
    if (isNaN(tgl.getTime())) return NextResponse.json({ error: "Format tanggal tidak valid" }, { status: 400 });
    tgl.setUTCHours(0, 0, 0, 0);
    // tanggal tidak boleh kemarin
    const today = new Date(); today.setUTCHours(0,0,0,0);
    if (tgl < today) return NextResponse.json({ error: "Tanggal tidak boleh di masa lalu" }, { status: 400 });

    let userId: string | null = (session?.user as any)?.id || null;
    let wargaId: string | null = null;
    let targetEmail: string | null = null;
    let targetNama: string | null = null;

    if (userId) {
      const u = await prisma.user.findUnique({ where: { id: userId } });
      if (!u) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
      targetEmail = u.email;
      targetNama = u.name;
    } else {
      const { nik, nama, email } = body as { nik?: string; nama?: string; email?: string };
      if (!nik || !nama) return NextResponse.json({ error: "Untuk booking tanpa login, NIK & Nama wajib diisi. Silakan login dulu." }, { status: 400 });
      if (nik.length !== 16 || !/^\d+$/.test(nik)) return NextResponse.json({ error: "NIK harus 16 digit angka" }, { status: 400 });
      if (email && !email.includes("@")) return NextResponse.json({ error: "Format email tidak valid" }, { status: 400 });
      let warga = await prisma.warga.findUnique({ where: { nik } });
      if (!warga) {
        warga = await prisma.warga.create({ data: { nik, nama, email: email || null } });
      } else if (warga.nama !== nama || warga.email !== (email || null)) {
        warga = await prisma.warga.update({ where: { id: warga.id }, data: { nama, email: email || null } });
      }
      wargaId = warga.id;
      targetEmail = email || warga.email;
      targetNama = nama;
    }

    // Kuota
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
        layananId: layanan.id,
        wargaId,
        userId,
      },
      include: { layanan: true },
    });

    await prisma.kuotaHarian.update({ where: { id: kuota.id }, data: { terisi: { increment: 1 } } });

    // Kirim email via Resend (non-blocking, jangan gagalkan booking)
    if (targetEmail) {
      sendBookingEmail(targetEmail, {
        nomor,
        layanan: layanan.nama,
        tanggal: tgl.toISOString().slice(0, 10),
        id: antrean.id,
      }).catch((e) => console.error("[booking] email failed", e));
    } else {
      console.warn("[booking] no email, skip send", antrean.id);
    }

    return NextResponse.json({ id: antrean.id, nomor, emailSent: !!targetEmail }, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/booking error", e);
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}
