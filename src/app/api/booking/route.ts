import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { sendBookingEmail } from "@/lib/email";
import { generateQR } from "@/lib/qr";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) {
      return NextResponse.json({ error: "Wajib login dulu. Silakan daftar atau masuk akun warga." }, { status: 401 });
    }

    const body = await req.json();
    const { layananKode, tanggal } = body as {
      layananKode?: string;
      tanggal?: string;
    };

    if (!layananKode || !tanggal) {
      return NextResponse.json({ error: "layananKode, tanggal wajib diisi" }, { status: 400 });
    }

    const layanan = await prisma.layanan.findUnique({ where: { kode: layananKode as any } });
    if (!layanan) return NextResponse.json({ error: "Layanan tidak ditemukan" }, { status: 404 });

    const tgl = new Date(tanggal);
    if (isNaN(tgl.getTime())) return NextResponse.json({ error: "Format tanggal tidak valid" }, { status: 400 });
    tgl.setUTCHours(0, 0, 0, 0);
    const today = new Date(); today.setUTCHours(0,0,0,0);
    if (tgl < today) return NextResponse.json({ error: "Tanggal tidak boleh di masa lalu" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "Akun tidak ditemukan, silakan login ulang" }, { status: 404 });

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
        userId: user.id,
        wargaId: null,
      },
      include: { layanan: true },
    });

    await prisma.kuotaHarian.update({ where: { id: kuota.id }, data: { terisi: { increment: 1 } } });

    // Email via Resend (non-blocking)
    const targetEmail = user.email;
    if (targetEmail) {
      const qrCode = await generateQR(`${process.env.NEXTAUTH_URL || "https://antri-capil.vercel.app"}/tiket/${antrean.id}`);
      sendBookingEmail(targetEmail, {
        nomor,
        layananKode: layanan.kode as string,
        layananNama: layanan.nama,
        tanggal: tgl.toISOString().slice(0, 10),
        qrCode,
      }).catch((e) => console.error("[booking] email failed", e));
    }

    return NextResponse.json({ id: antrean.id, nomor, emailSent: !!targetEmail }, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/booking error", e);
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}
