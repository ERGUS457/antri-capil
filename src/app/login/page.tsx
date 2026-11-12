'use client';
import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, ArrowRight, Building2, UserCheck, AlertCircle } from 'lucide-react';

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
      setError('Email/NIK atau kata sandi tidak valid. Silakan periksa kembali.');
      return;
    }
    if (res?.ok) {
      try {
        const sess = await fetch('/api/auth/session').then((r) => r.json());
        const role = (sess?.user as any)?.role;
        if (role === 'ADMIN') router.push('/admin');
        else router.push(callbackUrl);
      } catch {
        router.push(callbackUrl);
      }
      router.refresh();
    }
  }

  // Quick fill helper for convenience during evaluation
  const setQuickAccount = (emailVal: string) => {
    setForm({ email: emailVal, password: 'capil123' });
    setError('');
  };

  return (
    <div className="w-full max-w-md">
      {/* Kartu Login Utama */}
      <div className="bg-[#0A192F]/90 backdrop-blur-md rounded-3xl border border-[#D4AF37]/30 p-8 shadow-2xl relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header Instansi */}
        <div className="flex items-center gap-3.5 mb-6 pb-6 border-b border-white/10">
          <img
            src="/logo-sambas.png"
            alt="Lambang Kabupaten Sambas"
            className="w-12 h-12 rounded-xl object-contain bg-white/10 p-1.5 border border-white/20 shadow-md"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase">
                DISDUKCAPIL KAB. SAMBAS
              </span>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight uppercase">
              Portal Akses Sistem
            </h1>
            <p className="text-xs text-slate-400">
              Masuk Petugas Loket, Admin & Warga
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs px-4 py-3 rounded-2xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Email Resmi atau NIK (16 Digit)</span>
            </span>
            <input
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              placeholder="admin@disdukcapil.sambas.go.id atau NIK"
              className="bg-[#070F1E] border border-white/15 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Kata Sandi (Password)</span>
            </span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              placeholder="••••••••"
              className="bg-[#070F1E] border border-white/15 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition"
              required
            />
          </label>

          <button
            disabled={loading}
            type="submit"
            className="mt-2 w-full bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-[#0A192F] rounded-xl py-3.5 font-black text-sm hover:brightness-110 active:scale-[0.99] disabled:opacity-50 transition shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Memverifikasi Akun...</span>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Pintasan Akun Cepat untuk Uji Coba */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Pilihan Akses Operasional Cepat:</span>
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setQuickAccount('admin@disdukcapil.sambas.go.id')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition"
            >
              <p className="font-bold text-white text-[11px]">Administrator</p>
              <p className="text-[10px] text-slate-400 truncate">admin@disdukcapil...</p>
            </button>
            <button
              type="button"
              onClick={() => setQuickAccount('petugas@disdukcapil.sambas.go.id')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition"
            >
              <p className="font-bold text-white text-[11px]">Petugas Loket</p>
              <p className="text-[10px] text-slate-400 truncate">petugas@disdukcapil...</p>
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-2 text-xs text-slate-400">
          <p>
            Belum memiliki akun warga?{' '}
            <Link
              href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="text-[#D4AF37] font-bold hover:underline"
            >
              Daftar di sini
            </Link>
          </p>
          <Link
            href="/"
            className="text-slate-400 hover:text-white transition flex items-center gap-1 text-[11px] mt-1"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda Utama</span>
          </Link>
        </div>
      </div>

      {/* Footer Keamanan */}
      <div className="mt-4 text-center">
        <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sistem Terenkripsi & Dilindungi Standar Keamanan Adminduk</span>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#070F1E] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0F264A]/60 rounded-full blur-3xl pointer-events-none" />

      <Suspense
        fallback={
          <div className="bg-[#0A192F] rounded-3xl p-8 border border-white/10 text-white shadow-2xl text-center">
            Memuat formulir akses...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
