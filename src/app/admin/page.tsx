'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

type Antrean = {
  id: string; nomor: number; tanggal: string; status: string;
  warga: { nama: string; nik: string };
  layanan: { nama: string; kode: string };
};

export default function AdminPage() {
  const [data, setData] = useState<Antrean[]>([]);
  const [filter, setFilter] = useState({ tanggal: new Date().toISOString().slice(0, 10), status: 'MENUNGGU' });
  const [loading, setLoading] = useState(false);

  const fetchAntrean = useCallback(async () => {
    try {
      const res = await fetch(`/api/antrean?tanggal=${filter.tanggal}&status=${filter.status}`);
      const d = await res.json();
      setData(d.antrean || []);
    } catch (e) { console.error(e); }
  }, [filter]);

  useEffect(() => { fetchAntrean(); }, [fetchAntrean]);

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

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div><h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1><p className="text-zinc-500">Kelola antrean loket pelayanan.</p></div>
          <Link href="/display" target="_blank" className="bg-zinc-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-black">Buka Display TV ↗</Link>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6 flex flex-wrap gap-4 items-end">
          <label className="flex flex-col gap-1.5"><span className="text-xs font-bold text-zinc-500 uppercase">Tanggal</span>
            <input type="date" value={filter.tanggal} onChange={e => setFilter(s => ({ ...s, tanggal: e.target.value }))} className="border border-zinc-200 rounded-lg px-3 py-2 text-sm" />
          </label>
          <label className="flex flex-col gap-1.5"><span className="text-xs font-bold text-zinc-500 uppercase">Status</span>
            <select value={filter.status} onChange={e => setFilter(s => ({ ...s, status: e.target.value }))} className="border border-zinc-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="MENUNGGU">MENUNGGU</option><option value="DIPANGGIL">DIPANGGIL</option><option value="SELESAI">SELESAI</option><option value="LEWATI">LEWATI</option><option value="BATAL">BATAL</option>
            </select>
          </label>
          <button onClick={fetchAntrean} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">Refresh</button>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead><tr className="bg-zinc-50 border-b border-zinc-200"><th className="px-6 py-4 font-bold text-zinc-600 uppercase tracking-widest text-[10px]">No</th><th className="px-6 py-4 font-bold text-zinc-600 uppercase tracking-widest text-[10px]">Layanan</th><th className="px-6 py-4 font-bold text-zinc-600 uppercase tracking-widest text-[10px]">Warga</th><th className="px-6 py-4 font-bold text-zinc-600 uppercase tracking-widest text-[10px]">Status</th><th className="px-6 py-4 font-bold text-zinc-600 uppercase tracking-widest text-[10px]">Aksi</th></tr></thead>
            <tbody className="divide-y divide-zinc-100">
              {data.length === 0 ? <tr><td colSpan={5} className="px-6 py-20 text-center text-zinc-400">Tidak ada antrean</td></tr> : data.map(a => (
                <tr key={a.id} className="hover:bg-zinc-50/50 transition">
                  <td className="px-6 py-4 font-bold text-lg text-blue-600">{String(a.nomor).padStart(3, '0')}</td>
                  <td className="px-6 py-4"><div><p className="font-bold">{a.layanan.kode}</p><p className="text-xs text-zinc-500">{a.layanan.nama}</p></div></td>
                  <td className="px-6 py-4"><div><p className="font-semibold">{a.warga.nama}</p><p className="text-xs text-zinc-500">{a.warga.nik}</p></div></td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${a.status === 'DIPANGGIL' ? 'bg-blue-100 text-blue-700' : 'bg-zinc-100 text-zinc-600'}`}>{a.status}</span></td>
                  <td className="px-6 py-4"><div className="flex gap-2">
                    {a.status === 'MENUNGGU' && <button disabled={loading} onClick={() => patch(a.id, 'PANGGIL')} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Panggil</button>}
                    {a.status === 'DIPANGGIL' && <button disabled={loading} onClick={() => patch(a.id, 'SELESAI')} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Selesai</button>}
                    {(a.status === 'MENUNGGU' || a.status === 'DIPANGGIL') && <button disabled={loading} onClick={() => patch(a.id, 'LEWATI')} className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold">Lewati</button>}
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
