'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Stats = {
  tanggal: string;
  total: number;
  status: Record<string, number>;
  rataRataTungguMenit: number | null;
  layanan: { kode: string; nama: string; total: number }[];
};

const cards = [
  { key: 'total', label: 'Total Antrean', color: 'bg-teal-50 border-teal-200 text-teal-700' },
  { key: 'SELESAI', label: 'Selesai', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { key: 'MENUNGGU', label: 'Menunggu', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { key: 'BATAL', label: 'Batal', color: 'bg-red-50 border-red-200 text-red-700' },
] as const;

export default function StatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const role = (session?.user as any)?.role;

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  useEffect(() => {
    if (role !== 'ADMIN') return;
    setLoading(true);
    fetch(`/api/admin/stats?tanggal=${tanggal}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal memuat statistik.');
        setStats(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat statistik.'))
      .finally(() => setLoading(false));
  }, [tanggal, role]);

  if (status === 'loading') return <main className="min-h-screen bg-[#FFFBF0] grid place-items-center text-zinc-500">Memuat sesi...</main>;
  if (!session) return null;
  if (role !== 'ADMIN') return <main className="min-h-screen bg-[#FFFBF0] grid place-items-center text-red-600 font-bold">Akses ditolak.</main>;

  return (
    <main className="min-h-screen bg-[#FFFBF0] text-zinc-900 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <Link href="/admin" className="text-sm text-teal-600 font-bold hover:underline">← Dashboard Loket</Link>
            <h1 className="text-3xl font-black tracking-tight mt-2">Ringkasan Statistik</h1>
            <p className="text-sm text-zinc-500 mt-1">Pantauan layanan harian untuk kepala dinas.</p>
          </div>
          <label className="flex flex-col gap-1.5 text-xs font-bold text-zinc-500 uppercase tracking-widest">
            Tanggal laporan
            <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="bg-white border border-orange-200 rounded-xl px-4 py-3 text-sm text-zinc-900 normal-case tracking-normal focus:ring-2 focus:ring-teal-500 outline-none" />
          </label>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5">{error}</div>}
        {loading && !stats ? <p className="text-zinc-500">Memuat statistik...</p> : stats && <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map((card) => {
              const value = card.key === 'total' ? stats.total : stats.status[card.key] ?? 0;
              return <div key={card.key} className={`rounded-[20px] border p-5 ${card.color}`}><p className="text-xs font-black uppercase tracking-widest">{card.label}</p><p className="text-4xl font-black mt-2">{value}</p><p className="text-xs mt-1 opacity-75">antrean</p></div>;
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <section className="lg:col-span-2 bg-white rounded-[24px] border border-orange-100 p-6 shadow-sm">
              <h2 className="text-lg font-black">Antrean per Layanan</h2>
              <p className="text-sm text-zinc-500 mt-1">Distribusi pendaftar pada tanggal terpilih.</p>
              <div className="mt-5 space-y-4">
                {stats.layanan.length === 0 ? <p className="text-sm text-zinc-500">Belum ada data.</p> : stats.layanan.map((item) => {
                  const percent = stats.total ? Math.round((item.total / stats.total) * 100) : 0;
                  return <div key={item.kode}><div className="flex justify-between text-sm font-bold"><span>{item.kode} — {item.nama}</span><span className="text-teal-700">{item.total}</span></div><div className="h-3 bg-zinc-100 rounded-full mt-2 overflow-hidden"><div className="h-full bg-teal-600 rounded-full" style={{ width: `${percent}%` }} /></div></div>;
                })}
              </div>
            </section>
            <section className="bg-white rounded-[24px] border border-orange-100 p-6 shadow-sm">
              <h2 className="text-lg font-black">Waktu Pelayanan</h2>
              <p className="text-sm text-zinc-500 mt-1">Rata-rata dari dipanggil sampai selesai.</p>
              <p className="text-5xl font-black text-teal-600 mt-8">{stats.rataRataTungguMenit ?? '—'}<span className="text-lg ml-1">menit</span></p>
              <p className="text-xs text-zinc-500 mt-3">Hanya tiket berstatus SELESAI yang dihitung.</p>
            </section>
          </div>

          <div className="mt-6 bg-white rounded-[24px] border border-orange-100 p-6 shadow-sm">
            <h2 className="text-lg font-black">Status Hari Ini</h2>
            <div className="flex flex-wrap gap-3 mt-4">{Object.entries(stats.status).map(([key, value]) => <div key={key} className="bg-[#FFFBF0] rounded-xl px-4 py-3"><p className="text-xs text-zinc-500 font-bold">{key}</p><p className="text-xl font-black text-zinc-900">{value}</p></div>)}</div>
          </div>
        </>}
      </div>
    </main>
  );
}
