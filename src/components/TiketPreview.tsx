'use client';
import { useSession } from 'next-auth/react';
export default function TiketPreview() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const isAuthed = status === 'authenticated' && !!user;
  const displayName = isAuthed ? user.name : 'Budi Santoso';
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-black tracking-widest text-zinc-400 uppercase">Tiket Digital Kamu</p>
        <span className="bg-amber-100 text-amber-700 text-[11px] font-black px-3 py-1 rounded-full">MENUNGGU</span>
      </div>
      <div className="mt-4 flex gap-4 items-start">
        <div className="flex-1">
          <p className="text-xs font-bold tracking-widest text-teal-600">KTP • 14 SEP 2025 • 09:00</p>
          <p className="text-[44px] font-black leading-none tracking-tighter text-zinc-900 mt-1">A-012</p>
          <p className="text-sm text-zinc-600 mt-1">
            Atas nama <b className="text-zinc-900">{displayName}</b>
            {isAuthed && <span className="ml-1.5 inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">● sinkron akun</span>}
            {!isAuthed && <span className="ml-1 text-xs text-zinc-400">(contoh)</span>}
          </p>
          {isAuthed ? (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">● Sinkron dengan akun kamu — progres di Riwayat Saya</div>
          ) : (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">Daftar dulu — tiket atas nama akunmu</div>
          )}
        </div>
        <div className="w-[92px] h-[92px] rounded-2xl border-2 border-dashed border-zinc-200 grid place-items-center bg-zinc-50 text-zinc-400 text-[10px] font-bold leading-tight text-center p-2">QR CODE<br />tunjuk di loket</div>
      </div>
    </div>
  );
}
