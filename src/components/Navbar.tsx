'use client';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

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
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-orange-100">
      <div className="max-w-6xl mx-auto px-6 h-[68px] flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-[17px] tracking-tight shrink-0">
          <img src="/logo-sambas.png" alt="Lambang Kabupaten Sambas" className="w-9 h-9 rounded-xl object-contain border border-orange-100 shadow-sm bg-white" />
          <span className="text-zinc-900">Antri<span className="text-teal-600">Capil</span></span>
          <span className="hidden sm:inline text-[10px] font-bold tracking-widest bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full ml-1">SAMBAS</span>
        </Link>

        <div className="hidden md:flex items-center gap-1 text-sm">
          <Link href="/#layanan" className="px-3 py-2 rounded-full hover:bg-zinc-50 font-medium text-zinc-600">Layanan</Link>
          <Link href="/display" className="px-3 py-2 rounded-full hover:bg-zinc-50 font-medium text-zinc-600">Papan Antrean</Link>
          <Link href="/dashboard" className="px-3 py-2 rounded-full hover:bg-zinc-50 font-medium text-zinc-600">Riwayat Saya</Link>
        </div>

        <div className="flex items-center gap-2.5">
          {status === 'loading' ? (
            <div className="w-24 h-9 bg-zinc-100 rounded-full animate-pulse" />
          ) : !isAuthed ? (
            <>
              <Link href="/login" className="hidden sm:inline-flex px-5 py-2.5 rounded-full text-sm font-semibold text-zinc-700 hover:bg-zinc-100 border border-zinc-200">Masuk</Link>
              <Link href="/register" className="inline-flex bg-teal-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-teal-700 shadow-md shadow-teal-600/20 transition">Daftar</Link>
            </>
          ) : (
            <div className="relative" ref={ref}>
              <button onClick={() => setOpen(v => !v)} className="flex items-center gap-2.5 bg-white border border-orange-100 rounded-full pl-1 pr-3 py-1 shadow-sm hover:border-orange-200 transition">
                <span className="w-8 h-8 rounded-full bg-teal-600 text-white grid place-items-center font-black text-sm">{initial}</span>
                <span className="hidden sm:block text-sm font-bold text-zinc-800 max-w-[120px] truncate">{user?.name || user?.email}</span>
                <span className="text-zinc-400 text-xs">▼</span>
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-zinc-200 rounded-2xl shadow-xl overflow-hidden">
                  <div className="px-4 py-3 bg-[#FFFBF0] border-b border-orange-100">
                    <p className="font-bold text-sm truncate">{user?.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                    {user?.nik && <p className="text-[11px] text-zinc-400 mt-0.5">NIK {user.nik}</p>}
                    {user?.role === 'ADMIN' && <span className="inline-block mt-1 text-[10px] font-black bg-teal-600 text-white px-2 py-0.5 rounded-full">ADMIN</span>}
                  </div>
                  <div className="p-2 flex flex-col gap-1">
                    <Link href="/profile" onClick={() => setOpen(false)} className="px-3 py-2 rounded-xl hover:bg-zinc-50 text-sm font-medium">👤 Profil Saya</Link>
                    <Link href="/dashboard" onClick={() => setOpen(false)} className="px-3 py-2 rounded-xl hover:bg-zinc-50 text-sm font-medium">📋 Riwayat Antrean</Link>
                    <Link href="/booking" onClick={() => setOpen(false)} className="px-3 py-2 rounded-xl hover:bg-zinc-50 text-sm font-medium">🎫 Booking Antrean</Link>
                    {user?.role === 'ADMIN' && <Link href="/admin" onClick={() => setOpen(false)} className="px-3 py-2 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 text-sm font-bold">⚙️ Dashboard Loket</Link>}
                    <button onClick={() => signOut({ callbackUrl: '/' })} className="text-left px-3 py-2 rounded-xl hover:bg-red-50 text-sm font-medium text-red-600">Keluar</button>
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
