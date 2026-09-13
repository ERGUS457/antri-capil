"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Antrean = {
  id: string; nomor: number; tanggal: string; status: string;
  layanan: { kode: string; nama: string };
  warga?: { nama: string; nik: string } | null;
  user?: { name: string; email: string } | null;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<Antrean[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/antrean")
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setData(d.antrean || []);
      })
      .catch(e => setError(String(e.message)))
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading") return <div className="min-h-screen grid place-items-center text-zinc-500">Memuat sesi...</div>;
  if (status === "unauthenticated") return (
    <div className="min-h-screen grid place-items-center bg-[#FFFBF0] px-6">
      <div className="bg-white rounded-2xl border border-orange-100 p-8 max-w-sm w-full text-center shadow-sm">
        <img src="/logo-sambas.jpg" alt="Lambang Kabupaten Sambas" className="w-12 h-12 rounded-xl object-cover border border-orange-100 bg-white mx-auto" />
        <p className="font-black mt-3">Belum login</p>
        <p className="text-sm text-zinc-500 mt-1">Silakan login untuk melihat antrean Anda.</p>
        <Link href="/login" className="mt-4 inline-block bg-teal-600 text-white px-6 py-3 rounded-full font-bold">Masuk →</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFFBF0] text-zinc-900">
      <div className="max-w-4xl mx-auto px-6 h-[64px] flex items-center justify-between border-b border-orange-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2 font-black"><img src="/logo-sambas.jpg" alt="Lambang Kabupaten Sambas" className="w-8 h-8 rounded-xl object-cover border border-orange-100 bg-white" /> AntriCapil</Link>
        <Link href="/booking" className="bg-teal-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-teal-700">+ Booking</Link>
      </div>
      <div className="max-w-4xl mx-auto p-6 md:p-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Riwayat Saya</h1>
            <p className="text-sm text-zinc-500">Halo, <b>{(session?.user as any)?.name || session?.user?.email}</b> — pantau semua antrean Anda.</p>
          </div>
          <Link href="/booking" className="hidden md:inline-flex bg-teal-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-teal-700">+ Booking Baru</Link>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm mb-4">{error}</div>}
        {loading ? <p className="text-zinc-500">Memuat antrean...</p> : data.length === 0 ? (
          <div className="bg-white rounded-2xl border border-orange-100 p-12 text-center">
            <p className="text-zinc-500">Belum ada antrean.</p>
            <Link href="/booking" className="text-teal-600 font-bold text-sm mt-2 inline-block">Buat booking pertama →</Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {data.map(a => (
              <div key={a.id} className="bg-white rounded-2xl border border-orange-100 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-widest text-zinc-500">{a.layanan.kode} • {new Date(a.tanggal).toISOString().slice(0,10)}</p>
                  <p className="text-2xl font-black text-teal-600">{String(a.nomor).padStart(3,'0')} <span className="text-sm font-bold text-zinc-900">{a.layanan.nama}</span></p>
                  <p className="text-xs text-zinc-500 mt-1">Status: <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${a.status==='MENUNGGU'?'bg-amber-100 text-amber-700':a.status==='DIPANGGIL'?'bg-teal-100 text-teal-700':a.status==='SELESAI'?'bg-emerald-100 text-emerald-700':'bg-zinc-100 text-zinc-600'}`}>{a.status}</span></p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/tiket/${a.id}`} className="bg-zinc-900 text-white px-5 py-2.5 rounded-full text-sm font-bold">Lihat Tiket</Link>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-center text-xs text-zinc-400 mt-6"><Link href="/" className="hover:underline">← Beranda</Link> • <Link href="/display" className="hover:underline">Papan Antrean</Link></p>
      </div>
    </div>
  );
}
