'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/booking';
  const [form, setForm] = useState({ name: '', email: '', nik: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.nik && (form.nik.length !== 16 || !/^\d+$/.test(form.nik))) { setError('NIK harus 16 digit angka'); return; }
    if (form.password.length < 6) { setError('Password minimal 6 karakter'); return; }
    if (form.password !== form.confirm) { setError('Konfirmasi password tidak cocok'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, nik: form.nik || undefined, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal daftar');
      const loginRes = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
      if (loginRes?.error) throw new Error(loginRes.error);
      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  return (
    <div className="bg-white rounded-[24px] border border-orange-100 p-8 max-w-md w-full shadow-sm">
      <img src="/logo-sambas.jpg" alt="Lambang Kabupaten Sambas" className="w-11 h-11 rounded-xl object-cover border border-orange-100 bg-white shadow-sm" />
      <h1 className="text-2xl font-black mt-4 tracking-tight text-zinc-900">Daftar Akun Warga</h1>
      <p className="text-sm text-zinc-600 mt-1">Daftar sekali, bisa booking antrean & pantau progres kapan saja.</p>
      {error && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}
      <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-zinc-800">Nama Lengkap *</span>
          <input value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} placeholder="Nama sesuai KTP" className="bg-[#FFFBF0] border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white" required />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-zinc-800">Email *</span>
          <input type="email" value={form.email} onChange={e => setForm(s => ({ ...s, email: e.target.value }))} placeholder="email@contoh.com" className="bg-[#FFFBF0] border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white" required />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-zinc-800">NIK (16 digit)</span>
          <input value={form.nik} onChange={e => setForm(s => ({ ...s, nik: e.target.value.replace(/\D/g,'').slice(0,16) }))} placeholder="6101xxxxxxxxxxxx" className="bg-[#FFFBF0] border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white" />
          <span className="text-xs text-zinc-500">NIK dipakai untuk verifikasi di loket. Boleh dikosongkan, tapi disarankan diisi.</span>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-zinc-800">Password *</span>
          <input type="password" value={form.password} onChange={e => setForm(s => ({ ...s, password: e.target.value }))} placeholder="Minimal 6 karakter" className="bg-[#FFFBF0] border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white" required />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-zinc-800">Konfirmasi Password *</span>
          <input type="password" value={form.confirm} onChange={e => setForm(s => ({ ...s, confirm: e.target.value }))} placeholder="Ulangi password" className="bg-[#FFFBF0] border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white" required />
        </label>
        <button disabled={loading} type="submit" className="bg-teal-600 text-white rounded-full py-3.5 font-bold hover:bg-teal-700 disabled:opacity-50 shadow-md shadow-teal-600/20">{loading ? 'Memproses...' : 'Daftar & Lanjut →'}</button>
      </form>
      <p className="text-sm text-center text-zinc-600 mt-6">Sudah punya akun? <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-teal-600 font-bold hover:underline">Masuk</Link></p>
      <p className="text-xs text-center text-zinc-500 mt-3"><Link href="/" className="hover:underline">← Kembali ke Beranda</Link></p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF0] flex items-center justify-center px-6 py-10 text-zinc-900">
      <Suspense fallback={<div className="bg-white rounded-[24px] p-8 border border-orange-100 shadow-sm">Memuat...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
