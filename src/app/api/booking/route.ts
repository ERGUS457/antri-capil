import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { sendBookingEmail } from "@/lib/email";
import { generateQR } from "@/lib/qr";
import { toClientErrorMessage } from "@/lib/client-error";
import { appUrl } from "@/lib/app-url";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const sessionUserId = (session?.user as any)?.id as string | undefined;

    const body = await req.json();
    const { layananKode, tanggal, nama, nik, telepon, email } = body as {
      layananKode?: string;
      tanggal?: string;
      nama?: string;
      nik?: string;
      telepon?: string;
      email?: string;
    };

    if (!layananKode || !tanggal) {
      return NextResponse.json({ error: "Pilih layanan dan tanggal kunjungan" }, { status: 400 });
    }

    const layanan = await prisma.layanan.findUnique({ where: { kode: layananKode as any } });
    if (!layanan) return NextResponse.json({ error: "Layanan tidak ditemukan" }, { status: 404 });

    const tgl = new Date(tanggal);
    if (isNaN(tgl.getTime())) return NextResponse.json({ error: "Format tanggal tidak valid" }, { status: 400 });
    tgl.setUTCHours(0, 0, 0, 0);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (tgl < today) return NextResponse.json({ error: "Tanggal tidak boleh di masa lalu" }, { status: 400 });

    let finalUserId: string | null = null;
    let finalWargaId: string | null = null;
    let targetEmail: string | null = null;

    if (sessionUserId) {
      // Warga yang login
      const user = await prisma.user.findUnique({ where: { id: sessionUserId } });
      if (!user) return NextResponse.json({ error: "Akun tidak ditemukan, silakan login ulang" }, { status: 404 });
      finalUserId = user.id;
      targetEmail = user.email || null;
    } else {
      // Fast-Track (warga tanpa login)
      const cleanNik = (nik || "").replace(/\D/g, "");
      const cleanNama = (nama || "").trim();
      const cleanTelepon = (telepon || "").trim();
      const cleanEmail = (email || "").trim() || null;

      if (cleanNik.length !== 16) {
        return NextResponse.json({ error: "NIK harus terdiri dari 16 digit angka valid" }, { status: 400 });
      }
      if (!cleanNama || cleanNama.length < 3) {
        return NextResponse.json({ error: "Nama lengkap wajib diisi minimal 3 karakter" }, { status: 400 });
      }
      if (!cleanTelepon || cleanTelepon.length < 8) {
        return NextResponse.json({ error: "Nomor WhatsApp/HP aktif wajib diisi" }, { status: 400 });
      }

      // Upsert data warga
      const warga = await prisma.warga.upsert({
        where: { nik: cleanNik },
        update: {
          nama: cleanNama,
          telepon: cleanTelepon,
          ...(cleanEmail ? { email: cleanEmail } : {}),
        },
        create: {
          nik: cleanNik,
          nama: cleanNama,
          telepon: cleanTelepon,
          email: cleanEmail,
        },
      });
      finalWargaId = warga.id;
      targetEmail = cleanEmail;
    }

    // Cek apakah pemohon sudah memiliki antrean aktif untuk layanan & tanggal yang sama
    const existing = await prisma.antrean.findFirst({
      where: {
        layananId: layanan.id,
        tanggal: tgl,
        status: { in: ["MENUNGGU", "DIPANGGIL"] },
        OR: [
          ...(finalUserId ? [{ userId: finalUserId }] : []),
          ...(finalWargaId ? [{ wargaId: finalWargaId }] : []),
        ],
      },
      select: { id: true, nomor: true },
    });

    if (existing) {
      return NextResponse.json({
        id: existing.id,
        nomor: existing.nomor,
        alreadyBooked: true,
        message: "Anda sudah memiliki nomor antrean aktif untuk layanan dan tanggal ini.",
      }, { status: 200 });
    }

    // Cek dan update kuota
    let kuota = await prisma.kuotaHarian.findUnique({
      where: { layananId_tanggal: { layananId: layanan.id, tanggal: tgl } },
    });
    if (!kuota) {
      kuota = await prisma.kuotaHarian.create({
        data: { layananId: layanan.id, tanggal: tgl, jumlah: 80, terisi: 0 },
      });
    }
    if (kuota.terisi >= kuota.jumlah) {
      return NextResponse.json({ error: "Kuota harian penuh untuk tanggal ini. Silakan pilih hari lain." }, { status: 409 });
    }

    const last = await prisma.antrean.findFirst({
      where: { layananId: layanan.id, tanggal: tgl },
      orderBy: { nomor: "desc" },
      select: { nomor: true },
    });
    const nomor = (last?.nomor ?? 0) + 1;
    const qrToken = randomUUID().replace(/-/g, "").slice(0, 12);

    const antrean = await prisma.antrean.create({
      data: {
        nomor,
        tanggal: tgl,
        status: "MENUNGGU",
        layananId: layanan.id,
        userId: finalUserId,
        wargaId: finalWargaId,
        qrToken,
      },
      include: { layanan: true },
    });

    await prisma.kuotaHarian.update({
      where: { id: kuota.id },
      data: { terisi: { increment: 1 } },
    });

    // Kirim email tiket jika email diisi
    if (targetEmail) {
      const qrUrl = appUrl(`tiket/${antrean.id}`);
      generateQR(qrUrl)
        .then((qrCode) => {
          return sendBookingEmail(targetEmail!, {
            nomor,
            layananKode: layanan.kode as string,
            layananNama: layanan.nama,
            tanggal: tgl.toISOString().slice(0, 10),
            qrCode,
          });
        })
        .catch((e) => console.error("[booking] email failed", e));
    }

    return NextResponse.json({
      id: antrean.id,
      nomor,
      qrToken,
      emailSent: !!targetEmail,
    }, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/booking error", e);
    return NextResponse.json({ error: toClientErrorMessage(e) }, { status: 500 });
  }
}
