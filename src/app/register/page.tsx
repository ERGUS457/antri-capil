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
    <div className="bg-white rounded-[20px] border border-gray-200 p-8 max-w-md w-full shadow-sm">
      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white grid place-items-center font-bold">◈</div>
      <h1 className="text-2xl font-extrabold mt-4">Daftar Akun ANTRI-CAPIL</h1>
      <p className="text-sm text-gray-600 mt-1">Daftar dulu, lalu langsung booking antrean. Data tersimpan untuk pemantauan.</p>
      {error && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}
      <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Nama Lengkap *</span>
          <input value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} placeholder="Nama sesuai KTP" className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" required />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Email *</span>
          <input type="email" value={form.email} onChange={e => setForm(s => ({ ...s, email: e.target.value }))} placeholder="email@contoh.com" className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" required />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">NIK (16 digit, wajib untuk warga)</span>
          <input value={form.nik} onChange={e => setForm(s => ({ ...s, nik: e.target.value.replace(/\D/g,'').slice(0,16) }))} placeholder="3271xxxxxxxxxxxx" className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Password *</span>
          <input type="password" value={form.password} onChange={e => setForm(s => ({ ...s, password: e.target.value }))} placeholder="Minimal 6 karakter" className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" required />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Konfirmasi Password *</span>
          <input type="password" value={form.confirm} onChange={e => setForm(s => ({ ...s, confirm: e.target.value }))} placeholder="Ulangi password" className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" required />
        </label>
        <button disabled={loading} type="submit" className="bg-blue-600 text-white rounded-full py-3.5 font-semibold hover:bg-blue-700 disabled:opacity-50">{loading ? 'Memproses...' : 'Daftar & Lanjut Booking →'}</button>
      </form>
      <p className="text-sm text-center text-gray-600 mt-6">Sudah punya akun? <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-blue-600 font-semibold hover:underline">Masuk</Link></p>
      <p className="text-xs text-center text-gray-500 mt-3"><Link href="/" className="hover:underline">← Beranda</Link></p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-10 text-gray-900">
      <Suspense fallback={<div className="bg-white rounded-[20px] p-8 border">Memuat...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
