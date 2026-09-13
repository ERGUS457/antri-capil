'use client';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const [antreanCount, setAntreanCount] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/antrean').then(r => r.json()).then(d => setAntreanCount(d.antrean?.length ?? 0)).catch(() => {});
    }
  }, [status]);

  if (status === 'loading') return <div className="min-h-screen grid place-items-center bg-[#FFFBF0] text-zinc-500">Memuat profil...</div>;
  if (status === 'unauthenticated') return (
    <div className="min-h-screen grid place-items-center bg-[#FFFBF0] px-6">
      <div className="bg-white border border-orange-100 rounded-2xl p-8 max-w-sm w-full text-center">
        <p className="font-black">Belum login</p>
        <Link href="/login" className="mt-4 inline-block bg-teal-600 text-white px-6 py-2.5 rounded-full font-bold">Masuk →</Link>
      </div>
    </div>
  );

  const initial = (user?.name?.[0] || user?.email?.[0] || '?').toUpperCase();

  return (
    <div className="min-h-screen bg-[#FFFBF0] text-zinc-900">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">← Beranda</Link>

        <div className="mt-6 bg-white border border-orange-100 rounded-[24px] p-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white grid place-items-center font-black text-xl">{initial}</div>
            <div>
              <h1 className="text-xl font-black tracking-tight">{user?.name}</h1>
              <p className="text-sm text-zinc-500">{user?.email}</p>
              {user?.role === 'ADMIN' && <span className="inline-block mt-1 text-[10px] font-black bg-teal-600 text-white px-2 py-0.5 rounded-full">ADMIN — Dashboard Loket tersedia di menu</span>}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="bg-[#FFFBF0] border border-orange-100 rounded-2xl p-4">
              <p className="text-[11px] font-black tracking-widest text-zinc-400 uppercase">NIK</p>
              <p className="font-bold mt-1">{user?.nik || '— belum diisi'}</p>
            </div>
            <div className="bg-[#FFFBF0] border border-orange-100 rounded-2xl p-4">
              <p className="text-[11px] font-black tracking-widest text-zinc-400 uppercase">Total Antrean</p>
              <p className="font-black text-teal-600 text-xl mt-1">{antreanCount ?? '—'}</p>
            </div>
            <div className="bg-[#FFFBF0] border border-orange-100 rounded-2xl p-4">
              <p className="text-[11px] font-black tracking-widest text-zinc-400 uppercase">Role</p>
              <p className="font-bold mt-1">{user?.role}</p>
            </div>
            <div className="bg-[#FFFBF0] border border-orange-100 rounded-2xl p-4">
              <p className="text-[11px] font-black tracking-widest text-zinc-400 uppercase">Email</p>
              <p className="font-bold mt-1 text-sm break-all">{user?.email}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard" className="bg-teal-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-teal-700">Lihat Riwayat Saya</Link>
            <Link href="/booking" className="bg-white border border-zinc-200 px-6 py-2.5 rounded-full font-bold hover:bg-zinc-50">Booking Antrean</Link>
            {user?.role === 'ADMIN' && <Link href="/admin" className="bg-zinc-900 text-white px-6 py-2.5 rounded-full font-bold hover:bg-black">Buka Dashboard Loket</Link>}
          </div>

          <button onClick={() => signOut({ callbackUrl: '/' })} className="mt-6 text-sm text-red-600 font-bold hover:underline">Keluar dari akun →</button>
        </div>

        <p className="text-center text-xs text-zinc-400 mt-6">Data profil diambil dari akun login. Hubungi petugas loket jika perlu perubahan NIK/nama.</p>
      </div>
    </div>
  );
}
