'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const layananOptions = [
  { kode: 'KTP', label: 'KTP Elektronik' },
  { kode: 'KK', label: 'Kartu Keluarga' },
  { kode: 'KIA', label: 'KIA - Kartu Identitas Anak' },
  { kode: 'PINDAH', label: 'Pindah Datang' },
  { kode: 'AKTA', label: 'Akta Pencatatan Sipil' },
];

export default function BookingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user as any;

  const [form, setForm] = useState({ layananKode: 'KTP', tanggal: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.tanggal) { setError('Pilih tanggal kunjungan'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal booking');
      router.push(`/tiket/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  if (status === 'loading') return <div className="min-h-screen grid place-items-center bg-[#FFFBF0] text-zinc-500">Memuat sesi...</div>;

  return (
    <div className="min-h-screen bg-[#FFFBF0] text-zinc-900">
      <div className="max-w-6xl mx-auto px-6 h-[64px] flex items-center justify-between border-b border-orange-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2 font-black"><img src="/logo-sambas.jpg" alt="Lambang Kabupaten Sambas" className="w-8 h-8 rounded-xl object-cover border border-orange-100 bg-white shadow-sm" /> AntriCapil</Link>
        <Link href="/dashboard" className="text-sm font-bold text-teal-600 hover:underline">Riwayat Saya →</Link>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="text-sm text-zinc-600 hover:text-zinc-900 font-medium">← Beranda</Link>
        <span className="text-xs bg-white border border-orange-100 px-3 py-1 rounded-full font-bold text-zinc-500">Booking wajib login</span>
      </div>
      <div className="max-w-xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-[20px] border border-orange-100 p-8 shadow-sm">
          <h1 className="text-2xl font-black tracking-tight">Booking Antrean</h1>
          <p className="text-sm font-medium text-zinc-600 mt-1">Hanya untuk warga terdaftar. Data NIK & email diambil dari akun kamu.</p>

          <div className="mt-4 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-teal-700 uppercase tracking-widest">Akun warga</p>
              <p className="text-sm font-bold text-zinc-900">{user?.name || '-'}</p>
              <p className="text-xs text-zinc-600">{user?.email || ''} {user?.nik ? `• NIK ${user.nik}` : ''}</p>
            </div>
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" title="Login aktif" />
          </div>

          {error && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}

          <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-zinc-900">Layanan *</span>
              <select value={form.layananKode} onChange={e => setForm(s => ({ ...s, layananKode: e.target.value }))} className="bg-[#FFFBF0] border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white">
                {layananOptions.map(o => <option key={o.kode} value={o.kode}>{o.label} ({o.kode})</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-zinc-900">Tanggal Kunjungan *</span>
              <input type="date" value={form.tanggal} min={tomorrow} onChange={e => setForm(s => ({ ...s, tanggal: e.target.value }))} className="bg-[#FFFBF0] border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white" required />
              <span className="text-xs text-zinc-500">Kuota 80/hari per layanan. Pilih H+1 atau setelahnya. Tiket & QR dikirim ke email akun.</span>
            </label>

            <button disabled={loading} type="submit" className="mt-2 bg-teal-600 text-white rounded-full py-3.5 font-bold hover:bg-teal-700 disabled:opacity-50 shadow-md shadow-teal-600/20">
              {loading ? 'Memproses...' : 'Dapatkan Nomor Antrean →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
