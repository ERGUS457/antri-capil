import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { ANTREAN_PUBLIC_SELECT } from "@/lib/antrean-select";

async function getTicket(token: string) {
  return prisma.antrean.findFirst({
    where: { qrToken: token },
    select: ANTREAN_PUBLIC_SELECT,
  });
}

export default async function VerifyPage({
  params,
}: {
  params: { token: string };
}) {
  const ticket = await getTicket(params.token);
  if (!ticket) notFound();

  return (
    <main className="min-h-screen bg-[#FFFBF0] py-10 px-6">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-sm text-teal-600 font-bold hover:underline">
            ← Beranda
          </Link>
          <h1 className="text-2xl font-black tracking-tight mt-3 text-zinc-900">
            Verifikasi Tiket
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Tunjukkan halaman ini ke petugas loket untuk verifikasi.
          </p>
        </div>

        <div className="bg-white rounded-[24px] border border-orange-100 p-8 shadow-sm">
          <div className="text-center mb-8">
            <p className="text-xs font-bold tracking-widest text-teal-600 uppercase">
              Nomor Antrean
            </p>
            <p className="text-6xl font-black tracking-tight text-teal-600 mt-1">
              {String(ticket.nomor).padStart(3, "0")}
            </p>
            <p className="text-lg font-bold text-zinc-900 mt-2">
              {ticket.layanan.nama}
            </p>
            <p className="text-sm text-zinc-500">{ticket.layanan.kode}</p>
          </div>

          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
                Tanggal
              </dt>
              <dd className="font-bold mt-1 text-zinc-900">
                {new Date(ticket.tanggal).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
                Status
              </dt>
              <dd className="font-bold mt-1">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    ticket.status === "MENUNGGU"
                      ? "bg-amber-100 text-amber-700"
                      : ticket.status === "DIPANGGIL"
                        ? "bg-teal-100 text-teal-700"
                        : ticket.status === "SELESAI"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {ticket.status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
                Nomor
              </dt>
              <dd className="font-mono font-black mt-1 text-3xl text-zinc-900">
                {String(ticket.nomor).padStart(3, "0")}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
                Layanan
              </dt>
              <dd className="font-bold mt-1 text-zinc-900">
                {ticket.layanan.kode}
              </dd>
            </div>
          </dl>

          <div className="mt-6 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
            <p className="text-xs font-bold text-teal-700 uppercase tracking-widest">
              Petunjuk
            </p>
            <p className="text-sm text-teal-800 mt-1">
              Tunjukkan halaman ini ke petugas loket. Petugas akan memindai QR atau
              memasukkan kode tiket untuk memverifikasi identitas Anda.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
