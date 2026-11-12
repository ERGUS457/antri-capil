'use client';
import { useSession } from 'next-auth/react';
import { QrCode, ShieldCheck, Clock, MapPin } from 'lucide-react';

export default function TiketPreview() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const isAuthed = status === 'authenticated' && !!user;
  const displayName = isAuthed ? (user.name || 'Warga') : 'Ahmad Saputra';

  return (
    <div className="relative bg-gradient-to-b from-[#0F264A] to-[#0A192F] text-white p-5 sm:p-6 rounded-2xl border border-[#1E3A8A]/50 shadow-2xl overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#D4AF37]/15 rounded-full blur-2xl pointer-events-none" />

      {/* Ticket Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-[11px] font-bold tracking-widest text-[#D4AF37] uppercase">
            TIKET RESMI DISDUKCAPIL
          </p>
        </div>
        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full">
          SIAP DILAYANI
        </span>
      </div>

      {/* Main Ticket Info */}
      <div className="mt-4 flex flex-col sm:flex-row gap-5 items-center justify-between">
        <div className="flex-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <span className="text-[#D4AF37] font-bold">KTP ELEKTRONIK</span>
            <span>•</span>
            <span>Loket 02</span>
          </div>

          <div className="mt-1 flex items-baseline justify-center sm:justify-start gap-3">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono drop-shadow-sm">
              A-018
            </span>
          </div>

          <div className="mt-2 space-y-1">
            <p className="text-xs text-slate-200">
              Pemohon: <b className="text-white font-semibold">{displayName}</b>
            </p>
            <p className="text-[11px] text-slate-400 flex items-center justify-center sm:justify-start gap-1">
              <Clock className="w-3 h-3 text-[#D4AF37]" /> Perkiraan Panggilan: <span className="text-slate-200 font-medium">09:15 WIB</span>
            </p>
          </div>
        </div>

        {/* QR Code Graphic Box */}
        <div className="flex flex-col items-center bg-white p-3 rounded-xl shadow-lg border border-slate-200">
          <div className="w-20 h-20 grid place-items-center bg-slate-900 rounded-lg text-white">
            <QrCode className="w-14 h-14 text-white" />
          </div>
          <span className="mt-1.5 text-[9px] font-mono font-bold text-slate-700 tracking-wider">
            TOKEN: 8F2A-9C
          </span>
        </div>
      </div>

      {/* Bottom Status bar */}
      <div className="mt-4 pt-3 border-t border-dashed border-white/15 flex items-center justify-between text-[11px] text-slate-300">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" /> Kantor Disdukcapil Sambas
        </span>
        <span className="text-amber-300 font-medium">
          Sisa 2 antrean lagi
        </span>
      </div>
    </div>
  );
}
