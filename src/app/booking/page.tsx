'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const [form, setForm] = useState({ nik: '', nama: '', email: '', layananKode: 'KTP', tanggal: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update(k: string, v: string) { setForm(s => ({ ...s, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.nik.length !== 16) { setError('NIK harus 16 digit'); return; }
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 font-medium">← Kembali ke Beranda</Link>
      </div>
      <div className="max-w-xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-[20px] border border-gray-200 p-8 shadow-sm">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Booking Antrean</h1>
          <p className="text-sm font-medium text-gray-700 mt-1">Isi data sesuai KTP. Tiket & QR akan dikirim ke email.</p>

          {error && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}

          <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-gray-900">NIK (16 digit) *</span>
              <input value={form.nik} onChange={e => update('nik', e.target.value.replace(/\D/g, '').slice(0, 16))} placeholder="3271xxxxxxxxxxxx" className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" required />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-gray-900">Nama Lengkap *</span>
              <input value={form.nama} onChange={e => update('nama', e.target.value)} placeholder="Nama sesuai KTP" className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" required />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-gray-900">Email (untuk tiket & QR)</span>
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="email@contoh.com" className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-gray-900">Layanan *</span>
              <select value={form.layananKode} onChange={e => update('layananKode', e.target.value)} className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white">
                {layananOptions.map(o => <option key={o.kode} value={o.kode}>{o.label} ({o.kode})</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-gray-900">Tanggal Kunjungan *</span>
              <input type="date" value={form.tanggal} min={tomorrow} onChange={e => update('tanggal', e.target.value)} className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" required />
              <span className="text-xs text-gray-500">Kuota harian 80 per layanan. Pilih H+1 atau setelahnya.</span>
            </label>

            <button disabled={loading} type="submit" className="mt-2 bg-blue-600 text-white rounded-full py-3.5 font-semibold hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Memproses...' : 'Dapatkan Nomor Antrean →'}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-gray-500 mt-4">Dengan booking, Anda menyetujui antre sesuai kuota & jadwal layanan.</p>
      </div>
    </div>
  );
}
