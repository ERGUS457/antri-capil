'use client';
import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError('Email/NIK atau password salah');
      return;
    }
    if (res?.ok) {
      try {
        const sess = await fetch('/api/auth/session').then(r => r.json());
        const role = (sess?.user as any)?.role;
        if (role === 'ADMIN') router.push('/admin');
        else router.push(callbackUrl);
      } catch {
        router.push(callbackUrl);
      }
      router.refresh();
    }
  }

  return (
    <div className="bg-white rounded-[24px] border border-orange-100 p-8 max-w-md w-full shadow-sm">
      <img src="/logo-sambas.jpg" alt="Lambang Kabupaten Sambas" className="w-11 h-11 rounded-xl object-cover border border-orange-100 bg-white shadow-sm" />
      <h1 className="text-2xl font-black mt-4 tracking-tight text-zinc-900">Masuk</h1>
      <p className="text-sm text-zinc-600 mt-1">Masuk pakai email atau NIK yang sudah didaftarkan.</p>
      {error && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}
      <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-zinc-800">Email atau NIK</span>
          <input value={form.email} onChange={e => setForm(s => ({ ...s, email: e.target.value }))} placeholder="email@contoh.com atau 6101..." className="bg-[#FFFBF0] border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white" required />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-zinc-800">Password</span>
          <input type="password" value={form.password} onChange={e => setForm(s => ({ ...s, password: e.target.value }))} placeholder="••••••••" className="bg-[#FFFBF0] border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white" required />
        </label>
        <button disabled={loading} type="submit" className="bg-teal-600 text-white rounded-full py-3.5 font-bold hover:bg-teal-700 disabled:opacity-50 shadow-md shadow-teal-600/20">{loading ? 'Memproses...' : 'Masuk →'}</button>
      </form>
      <p className="text-sm text-center text-zinc-600 mt-6">Belum punya akun? <Link href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-teal-600 font-bold hover:underline">Daftar dulu</Link></p>
      <p className="text-xs text-center text-zinc-500 mt-3"><Link href="/" className="hover:underline">← Kembali ke Beranda</Link></p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF0] flex items-center justify-center px-6 py-10 text-zinc-900">
      <Suspense fallback={<div className="bg-white rounded-[24px] p-8 border border-orange-100 shadow-sm">Memuat...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
