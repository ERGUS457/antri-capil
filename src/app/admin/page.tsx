'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type Antrean = {
  id: string; nomor: number; tanggal: string; status: string;
  warga: { nama: string; nik: string };
  layanan: { nama: string; kode: string };
};

function AdminContent() {
  const searchParams = useSearchParams();
  const keyParam = searchParams.get('key') || '';
  const [authed, setAuthed] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [data, setData] = useState<Antrean[]>([]);
  const [filter, setFilter] = useState({ tanggal: new Date().toISOString().slice(0, 10), status: 'MENUNGGU' });
  const [loading, setLoading] = useState(false);

  // Check initial password from session storage or URL param
  useEffect(() => {
    const savedKey = sessionStorage.getItem('admin_capil_auth');
    if (savedKey === 'capil123' || keyParam === 'capil123') {
      if (keyParam === 'capil123') sessionStorage.setItem('admin_capil_auth', 'capil123');
      setAuthed(true);
    }
  }, [keyParam]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'capil123') {
      sessionStorage.setItem('admin_capil_auth', 'capil123');
      setAuthed(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Password salah! Gunakan password yang benar.');
    }
  };

  const fetchAntrean = useCallback(async () => {
    if (!authed) return;
    try {
      const res = await fetch(`/api/antrean?tanggal=${filter.tanggal}&status=${filter.status}`);
      const d = await res.json();
      setData(d.antrean || []);
    } catch (e) { console.error(e); }
  }, [authed, filter]);

  useEffect(() => { if (authed) fetchAntrean(); }, [authed, fetchAntrean]);

  async function patch(id: string, action: string) {
    setLoading(true);
    try {
      await fetch('/api/antrean', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      fetchAntrean();
    } finally { setLoading(false); }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-gray-900">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white grid place-items-center text-xl font-bold mb-4">🔒</div>
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">Masukkan password admin untuk mengakses Dashboard Loket Disdukcapil.</p>

          {errorMsg && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{errorMsg}</div>}

          <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">Password Admin</span>
              <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="••••••••" className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" required />
            </label>
            <button type="submit" className="bg-blue-600 text-white rounded-full py-3.5 font-semibold hover:bg-blue-700">Masuk Dashboard →</button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-gray-500 hover:underline">← Kembali ke Beranda Utama</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div><h1 className="text-3xl font-bold tracking-tight">Admin Dashboard Loket</h1><p className="text-gray-500">Kelola antrean loket pelayanan kependudukan.</p></div>
          <div className="flex items-center gap-3">
            <Link href="/display" target="_blank" className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-black">Buka Display TV ↗</Link>
            <button onClick={() => { sessionStorage.removeItem('admin_capil_auth'); setAuthed(false); }} className="bg-red-50 text-red-600 border border-red-200 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-red-100">Keluar</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 flex flex-wrap gap-4 items-end shadow-sm">
          <label className="flex flex-col gap-1.5"><span className="text-xs font-bold text-gray-500 uppercase">Tanggal</span>
            <input type="date" value={filter.tanggal} onChange={e => setFilter(s => ({ ...s, tanggal: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white" />
          </label>
          <label className="flex flex-col gap-1.5"><span className="text-xs font-bold text-gray-500 uppercase">Status</span>
            <select value={filter.status} onChange={e => setFilter(s => ({ ...s, status: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white">
              <option value="MENUNGGU">MENUNGGU</option><option value="DIPANGGIL">DIPANGGIL</option><option value="SELESAI">SELESAI</option><option value="LEWATI">LEWATI</option><option value="BATAL">BATAL</option>
            </select>
          </label>
          <button onClick={fetchAntrean} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700">Refresh Data</button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-200"><th className="px-6 py-4 font-bold text-gray-600 uppercase tracking-widest text-[10px]">No</th><th className="px-6 py-4 font-bold text-gray-600 uppercase tracking-widest text-[10px]">Layanan</th><th className="px-6 py-4 font-bold text-gray-600 uppercase tracking-widest text-[10px]">Warga</th><th className="px-6 py-4 font-bold text-gray-600 uppercase tracking-widest text-[10px]">Status</th><th className="px-6 py-4 font-bold text-gray-600 uppercase tracking-widest text-[10px]">Aksi</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {data.length === 0 ? <tr><td colSpan={5} className="px-6 py-20 text-center text-gray-400">Tidak ada antrean</td></tr> : data.map(a => (
                <tr key={a.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4 font-bold text-lg text-blue-600">{String(a.nomor).padStart(3, '0')}</td>
                  <td className="px-6 py-4"><div><p className="font-bold text-gray-900">{a.layanan.kode}</p><p className="text-xs text-gray-500">{a.layanan.nama}</p></div></td>
                  <td className="px-6 py-4"><div><p className="font-semibold text-gray-900">{a.warga.nama}</p><p className="text-xs text-gray-500">{a.warga.nik}</p></div></td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${a.status === 'DIPANGGIL' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{a.status}</span></td>
                  <td className="px-6 py-4"><div className="flex gap-2">
                    {a.status === 'MENUNGGU' && <button disabled={loading} onClick={() => patch(a.id, 'PANGGIL')} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700">Panggil</button>}
                    {a.status === 'DIPANGGIL' && <button disabled={loading} onClick={() => patch(a.id, 'SELESAI')} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700">Selesai</button>}
                    {(a.status === 'MENUNGGU' || a.status === 'DIPANGGIL') && <button disabled={loading} onClick={() => patch(a.id, 'LEWATI')} className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-200">Lewati</button>}
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
