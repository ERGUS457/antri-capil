'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Antrean = {
  id: string; nomor: number; tanggal: string; status: string;
  warga: { nama: string; nik: string } | null;
  user: { name: string; email: string; nik: string | null } | null;
  layanan: { nama: string; kode: string };
};

function AdminContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = (session?.user as any)?.role;
  const isAdmin = role === 'ADMIN';

  const [data, setData] = useState<Antrean[]>([]);
  const [filter, setFilter] = useState({ tanggal: '', status: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const fetchAntrean = useCallback(async () => {
    if (!isAdmin) return;
    setErr('');
    try {
      const qs = new URLSearchParams();
      if (filter.tanggal) qs.set('tanggal', filter.tanggal);
      if (filter.status) qs.set('status', filter.status);
      const res = await fetch(`/api/antrean?${qs.toString()}`);
      const d = await res.json();
      if (!res.ok) setErr(d.error || 'Gagal memuat data');
      else setData(d.antrean || []);
    } catch (e: any) { setErr(e.message); }
  }, [isAdmin, filter]);

  useEffect(() => { if (isAdmin) fetchAntrean(); }, [isAdmin, fetchAntrean]);

  // polling realtime 5s untuk update admin otomatis
  useEffect(() => {
    if (!isAdmin) return;
    const iv = setInterval(fetchAntrean, 5000);
    return () => clearInterval(iv);
  }, [isAdmin, fetchAntrean]);

  async function patch(id: string, action: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/antrean', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const d = await res.json();
      if (!res.ok) setErr(d.error || 'Gagal update');
      else fetchAntrean();
    } finally { setLoading(false); }
  }

  if (status === 'loading') return <div className="min-h-screen grid place-items-center text-zinc-500">Memuat sesi...</div>;

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-gray-900">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full shadow-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white grid place-items-center text-xl font-bold mx-auto">🔒</div>
          <h1 className="text-2xl font-bold mt-4">Admin Loket</h1>
          <p className="text-sm text-gray-500 mt-1">Login sebagai admin untuk kelola antrean.</p>
          <Link href="/login" className="mt-6 inline-block bg-blue-600 text-white rounded-full px-8 py-3 font-bold hover:bg-blue-700">Login Admin →</Link>
          <p className="text-xs text-gray-400 mt-4">Akun admin: admin@disdukcapil.sambas.go.id / capil123</p>
          <Link href="/" className="block text-xs text-gray-500 hover:underline mt-3">← Beranda</Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-gray-900">
        <div className="bg-white rounded-2xl border p-8 max-w-md w-full text-center">
          <p className="font-bold text-red-600">Akses Ditolak</p>
          <p className="text-sm text-zinc-500 mt-1">Akun <b>{session.user?.email}</b> bukan ADMIN.</p>
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="mt-4 bg-zinc-900 text-white px-6 py-2.5 rounded-full text-sm font-bold">Ganti Akun</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div><h1 className="text-3xl font-bold tracking-tight">Admin Dashboard Loket</h1><p className="text-gray-500 text-sm">Login sebagai <b>{(session.user as any)?.name}</b> • auto-refresh 5s</p></div>
          <div className="flex items-center gap-3">
            <Link href="/display" target="_blank" className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-black">Display TV ↗</Link>
            <Link href="/dashboard" className="bg-white border px-4 py-2.5 rounded-xl text-sm font-medium">Dashboard Warga</Link>
            <button onClick={() => signOut({ callbackUrl: '/' })} className="bg-red-50 text-red-600 border border-red-200 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-red-100">Keluar</button>
          </div>
        </div>

        {err && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{err}</div>}

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 flex flex-wrap gap-4 items-end shadow-sm">
          <label className="flex flex-col gap-1.5"><span className="text-xs font-bold text-gray-500 uppercase">Tanggal</span>
            <div className="flex gap-2 items-center">
              <input type="date" value={filter.tanggal} onChange={e => setFilter(s => ({ ...s, tanggal: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white" />
              {filter.tanggal && <button onClick={() => setFilter(s => ({ ...s, tanggal: '' }))} className="text-xs font-bold text-blue-600 hover:underline whitespace-nowrap">Semua tanggal</button>}
              {!filter.tanggal && <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full">Semua tanggal</span>}
            </div>
          </label>
          <label className="flex flex-col gap-1.5"><span className="text-xs font-bold text-gray-500 uppercase">Status</span>
            <select value={filter.status} onChange={e => setFilter(s => ({ ...s, status: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white">
              <option value="">Semua Status</option><option value="MENUNGGU">MENUNGGU</option><option value="DIPANGGIL">DIPANGGIL</option><option value="SELESAI">SELESAI</option><option value="LEWATI">LEWATI</option><option value="BATAL">BATAL</option>
            </select>
          </label>
          <button onClick={fetchAntrean} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700">Refresh</button>
          <span className="text-xs text-zinc-400 ml-auto">{data.length} antrean • {filter.tanggal || 'Semua tanggal'} • {filter.status || 'Semua status'}</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-200"><th className="px-6 py-4 font-bold text-gray-600 uppercase tracking-widest text-[10px]">No</th><th className="px-6 py-4 font-bold text-gray-600 uppercase tracking-widest text-[10px]">Layanan</th><th className="px-6 py-4 font-bold text-gray-600 uppercase tracking-widest text-[10px]">Warga</th><th className="px-6 py-4 font-bold text-gray-600 uppercase tracking-widest text-[10px]">Status</th><th className="px-6 py-4 font-bold text-gray-600 uppercase tracking-widest text-[10px]">Aksi</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {data.length === 0 ? <tr><td colSpan={5} className="px-6 py-20 text-center text-gray-400">Tidak ada antrean untuk filter ini</td></tr> : data.map(a => (
                <tr key={a.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4 font-bold text-lg text-blue-600">{String(a.nomor).padStart(3, '0')}</td>
                  <td className="px-6 py-4"><div><p className="font-bold text-gray-900">{a.layanan.kode}</p><p className="text-xs text-gray-500">{a.layanan.nama}</p></div></td>
                  <td className="px-6 py-4"><div><p className="font-semibold text-gray-900">{a.user?.name || a.warga?.nama || '-'}</p><p className="text-xs text-gray-500">{a.user?.nik || a.warga?.nik || ''} • {a.user?.email || ''}</p></div></td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${a.status === 'DIPANGGIL' ? 'bg-blue-100 text-blue-700' : a.status === 'MENUNGGU' ? 'bg-amber-100 text-amber-700' : a.status === 'SELESAI' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{a.status}</span></td>
                  <td className="px-6 py-4"><div className="flex gap-2">
                    {a.status === 'MENUNGGU' && <button disabled={loading} onClick={() => patch(a.id, 'PANGGIL')} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50">Panggil</button>}
                    {a.status === 'DIPANGGIL' && <button disabled={loading} onClick={() => patch(a.id, 'SELESAI')} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:opacity-50">Selesai</button>}
                    {(a.status === 'MENUNGGU' || a.status === 'DIPANGGIL') && <button disabled={loading} onClick={() => patch(a.id, 'LEWATI')} className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-200 disabled:opacity-50">Lewati</button>}
                    {(a.status === 'MENUNGGU' || a.status === 'DIPANGGIL') && <button disabled={loading} onClick={() => patch(a.id, 'BATAL')} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 disabled:opacity-50">Batal</button>}
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 grid place-items-center text-gray-500">Memuat...</div>}>
      <AdminContent />
    </Suspense>
  );
}
