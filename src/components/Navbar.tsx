'use client';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { User, ShieldCheck, Ticket, Monitor, FileSearch, LogIn, LogOut, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const isAuthed = status === 'authenticated' && !!user;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const initial = (user?.name?.[0] || user?.email?.[0] || '?').toUpperCase();

  return (
    <nav className="sticky top-0 z-50 bg-[#0A192F]/95 backdrop-blur-md border-b border-[#1E293B] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between gap-4">
        {/* Brand identity */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="relative">
            <img
              src="/logo-sambas.png"
              alt="Lambang Kabupaten Sambas"
              className="w-10 h-10 object-contain drop-shadow-md rounded-lg p-0.5 bg-white/10 border border-white/20 transition-transform group-hover:scale-105"
            />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#D4AF37] rounded-full ring-2 ring-[#0A192F]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                ANTRI<span className="text-[#D4AF37]">-CAPIL</span>
              </span>
              <span className="text-[10px] font-bold tracking-wider bg-[#D4AF37]/20 text-[#F5DEB3] border border-[#D4AF37]/40 px-1.5 py-0.5 rounded">
                SAMBAS
              </span>
            </div>
            <span className="text-[10px] text-slate-300 font-medium tracking-wide hidden sm:block">
              Disdukcapil Kabupaten Sambas
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 text-sm font-medium">
          <Link
            href="/"
            className="px-3.5 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            Beranda
          </Link>
          <Link
            href="/#layanan"
            className="px-3.5 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            Layanan
          </Link>
          <Link
            href="/display"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Monitor className="w-4 h-4 text-[#D4AF37]" />
            <span>Layar Antrean TV</span>
          </Link>
          <Link
            href="/tracking"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <FileSearch className="w-4 h-4 text-emerald-400" />
            <span>Cek Tiket (NIK)</span>
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#F3C350] text-[#0A192F] font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            <Ticket className="w-4 h-4" />
            <span>Ambil Antrean Cepat</span>
          </Link>

          {status === 'loading' ? (
            <div className="w-9 h-9 bg-white/10 rounded-xl animate-pulse" />
          ) : !isAuthed ? (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 border border-white/15 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Masuk Petugas</span>
            </Link>
          ) : (
            <div className="relative" ref={ref}>
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-2.5 py-1.5 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-[#D4AF37] text-[#0A192F] grid place-items-center font-black text-xs">
                  {initial}
                </div>
                <span className="hidden md:block text-xs font-semibold text-slate-100 max-w-[100px] truncate">
                  {user?.name || user?.email}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0F264A] border border-[#1E3A8A] rounded-2xl shadow-2xl overflow-hidden z-50 text-slate-100">
                  <div className="p-4 bg-[#0A192F] border-b border-[#1E3A8A]/50">
                    <p className="font-bold text-sm text-white truncate">{user?.name || 'Warga'}</p>
                    <p className="text-xs text-slate-300 truncate">{user?.email}</p>
                    {user?.nik && (
                      <p className="text-[11px] text-[#D4AF37] font-mono mt-1">NIK: {user.nik}</p>
                    )}
                    {user?.role === 'ADMIN' && (
                      <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3" /> PETUGAS / ADMIN
                      </span>
                    )}
                  </div>

                  <div className="p-2 flex flex-col gap-1 text-xs">
                    <Link
                      href="/tracking"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 transition"
                    >
                      <Ticket className="w-4 h-4 text-[#D4AF37]" />
                      <span>Tiket Antrean Aktif</span>
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 transition"
                    >
                      <User className="w-4 h-4 text-sky-400" />
                      <span>Riwayat Pelayanan</span>
                    </Link>

                    {user?.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-200 font-bold hover:bg-blue-600/50 transition"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                        <span>Meja Loket & Panggilan</span>
                      </Link>
                    )}

                    <div className="h-px bg-white/10 my-1" />

                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-rose-300 hover:bg-rose-500/20 transition font-medium"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Keluar Akun</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
