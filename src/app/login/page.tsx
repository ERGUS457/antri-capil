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
      // fetch session to decide redirect by role
      try {
        const sess = await fetch('/api/auth/session').then(r => r.json());
        const role = (sess?.user as any)?.role || sess?.role;
        // fallback: fetch via server check
        if (role === 'ADMIN') router.push('/admin');
        else router.push(callbackUrl);
      } catch {
        router.push(callbackUrl);
      }
      router.refresh();
    }
  }

  return (
    <div className="bg-white rounded-[20px] border border-gray-200 p-8 max-w-md w-full shadow-sm">
      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white grid place-items-center font-bold">◈</div>
      <h1 className="text-2xl font-extrabold mt-4">Masuk ANTRI-CAPIL</h1>
      <p className="text-sm text-gray-600 mt-1">Gunakan email atau NIK dan password Anda.</p>
      {error && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}
      <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Email atau NIK</span>
          <input value={form.email} onChange={e => setForm(s => ({ ...s, email: e.target.value }))} placeholder="email@contoh.com atau 3271..." className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" required />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Password</span>
          <input type="password" value={form.password} onChange={e => setForm(s => ({ ...s, password: e.target.value }))} placeholder="••••••••" className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" required />
        </label>
        <button disabled={loading} type="submit" className="bg-blue-600 text-white rounded-full py-3.5 font-semibold hover:bg-blue-700 disabled:opacity-50">{loading ? 'Memproses...' : 'Masuk →'}</button>
      </form>
      <p className="text-sm text-center text-gray-600 mt-6">Belum punya akun? <Link href="/register" className="text-blue-600 font-semibold hover:underline">Daftar</Link></p>
      <p className="text-xs text-center text-gray-500 mt-3"><Link href="/" className="hover:underline">← Kembali ke Beranda</Link> · <Link href="/admin" className="hover:underline">Admin</Link></p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-10 text-gray-900">
      <Suspense fallback={<div className="bg-white rounded-[20px] p-8 border border-gray-200">Memuat...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
