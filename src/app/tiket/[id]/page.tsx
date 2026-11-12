'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import {
  Printer,
  Share2,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Home,
} from 'lucide-react';

type Tiket = {
  id: string;
  nomor: number;
  tanggal: string;
  status: string;
  nomorLoket?: number | null;
  waktuPanggil?: string | null;
  antreanDiDepan?: number;
  warga?: { nik: string; nama: string; email?: string | null } | null;
  user?: { nik: string | null; name: string; email: string } | null;
  layanan: { kode: string; nama: string };
};

export default function TiketPage() {
  const { id } = useParams() as { id: string };
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const [tiket, setTiket] = useState<Tiket | null>(null);
  const [qr, setQr] = useState('');
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function loadTiket(silent = false) {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/antrean?id=${id}`);
      const d = await res.json();
      if (d.error) {
        setError(d.error);
        return;
      }
      setTiket(d);
      const url = `${window.location.origin}/tiket/${d.id}`;
      setQr(await QRCode.toDataURL(url, { width: 280, margin: 1 }));
    } catch (e: any) {
      if (!silent) setError(String(e.message));
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadTiket();
    // Auto-refresh status antrean setiap 10 detik
    const timer = setInterval(() => {
      loadTiket(true);
    }, 10000);
    return () => clearInterval(timer);
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 grid place-items-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Tiket Tidak Ditemukan</h2>
          <p className="text-xs text-slate-600 mt-1">{error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/booking"
              className="bg-[#0A192F] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#0F264A]"
            >
              Ambil Antrean Baru
            </Link>
            <Link
              href="/"
              className="border border-slate-200 bg-white px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700"
            >
              Ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!tiket) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="min-h-[60vh] grid place-items-center text-slate-500 text-sm">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#0A192F]" />
            <span>Memuat data tiket resmi...</span>
          </div>
        </div>
      </div>
    );
  }

  const kodeNomor = `${tiket.layanan.kode}-${String(tiket.nomor).padStart(3, '0')}`;
  const namaPemohon = tiket.user?.name || tiket.warga?.nama || 'Warga';
  const nikPemohon = tiket.user?.nik || tiket.warga?.nik || '—';
  const tglFormatted = new Date(tiket.tanggal).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const shareText = `Halo! Ini nomor antrean resmi Disdukcapil Sambas saya: *${kodeNomor}* (${tiket.layanan.nama}) untuk tanggal ${tglFormatted}. Cek status tiket di: ${typeof window !== 'undefined' ? window.location.href : ''}`;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans pb-16 print:bg-white print:p-0">
      <div className="print:hidden">
        <Navbar />
      </div>

      <div className="max-w-md mx-auto px-4 pt-6 sm:pt-10">
        {/* Status Notification Banner */}
        <div className="text-center mb-5 print:hidden">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Tiket Antrean Berhasil Didaftarkan</span>
          </div>
        </div>

        {/* SMART TICKET CARD (Gov-Tech Boarding Pass Style) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden print:border print:shadow-none">
          {/* Header Tiket: Navy & Gold */}
          <div className="bg-gradient-to-br from-[#0A192F] via-[#0F264A] to-[#0A192F] text-white p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <img
                  src="/logo-sambas.png"
                  alt="Lambang Sambas"
                  className="w-8 h-8 rounded-lg object-contain bg-white/10 p-0.5 border border-white/20"
                />
                <div>
                  <h3 className="text-xs font-black tracking-wide text-white">DISDUKCAPIL</h3>
                  <p className="text-[10px] text-slate-300 font-medium">Kabupaten Sambas</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-[#D4AF37]/20 text-[#F5DEB3] border border-[#D4AF37]/40 px-2 py-0.5 rounded">
                E-TIKET RESMI
              </span>
            </div>

            {/* Antrean & Nomor Besar */}
            <div className="mt-5 text-center">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#D4AF37]">
                NOMOR PANGGILAN ANTREAN
              </span>
              <div className="mt-1 text-5xl sm:text-6xl font-black font-mono tracking-tight text-white drop-shadow-sm">
                {kodeNomor}
              </div>
              <p className="mt-1.5 text-sm font-semibold text-slate-200">
                {tiket.layanan.nama}
              </p>
            </div>

            {/* Status Live Calling */}
            <div className="mt-4 pt-3 border-t border-dashed border-white/15 flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1.5">
                Status Saat Ini:
              </span>
              <span
                className={`font-black px-2.5 py-0.5 rounded-full text-[11px] ${
                  tiket.status === 'DIPANGGIL'
                    ? 'bg-emerald-500 text-white animate-bounce'
                    : tiket.status === 'SELESAI'
                    ? 'bg-slate-700 text-slate-300'
                    : 'bg-amber-400 text-[#0A192F]'
                }`}
              >
                {tiket.status === 'DIPANGGIL'
                  ? `DIPANGGIL KE LOKET ${tiket.nomorLoket || '01'}`
                  : tiket.status}
              </span>
            </div>
          </div>

          {/* Ticket Perforation Graphic Notch */}
          <div className="relative flex items-center justify-between px-3 bg-white py-2">
            <div className="w-5 h-5 -ml-6 rounded-full bg-slate-100/70 border-r border-slate-200" />
            <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-2" />
            <div className="w-5 h-5 -mr-6 rounded-full bg-slate-100/70 border-l border-slate-200" />
          </div>

          {/* Body Tiket: QR Code & Detail Pemohon */}
          <div className="p-6 pt-2 space-y-5">
            {/* QR Code Container */}
            <div className="flex flex-col items-center">
              {qr ? (
                <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
                  <img src={qr} alt="QR Tiket" className="w-44 h-44 object-contain" />
                </div>
              ) : (
                <div className="w-44 h-44 bg-slate-100 rounded-2xl animate-pulse" />
              )}
              <span className="mt-2 text-[10px] font-mono text-slate-600 font-bold uppercase tracking-wider">
                TUNJUKKAN QR CODE INI KE PETUGAS LOKET
              </span>
            </div>

            {/* Identitas Pemohon Grid */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Nama Pemohon</span>
                <span className="font-bold text-slate-900">{namaPemohon}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Nomor Induk (NIK)</span>
                <span className="font-mono font-bold text-slate-900">{nikPemohon}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Tanggal Kunjungan</span>
                <span className="font-bold text-slate-900">{tglFormatted}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Estimasi Antrean</span>
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {typeof tiket.antreanDiDepan === 'number'
                    ? `${tiket.antreanDiDepan} orang di depan Anda`
                    : 'Sesuai urutan panggilan'}
                </span>
              </div>
            </div>

            {/* Petunjuk Kedatangan */}
            <div className="text-[11px] text-slate-600 bg-blue-50/70 border border-blue-100 rounded-xl p-3 flex items-start gap-2">
              <Clock className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Harap hadir 15 menit sebelum jam operasional loket dimulai (08.00–15.00 WIB) membawa berkas persyaratan asli dan fotokopi.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons (Print, Share, Back) */}
        <div className="mt-5 space-y-2.5 print:hidden">
          <div className="flex gap-2.5">
            <button
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-2 bg-[#0A192F] text-white rounded-xl py-3 text-xs font-bold hover:bg-[#0F264A] transition shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF Tiket</span>
            </button>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-xl px-4 py-3 text-xs font-bold hover:bg-emerald-700 transition shadow-md"
              title="Bagikan ke WhatsApp"
            >
              <Share2 className="w-4 h-4" />
              <span>Share WA</span>
            </a>
          </div>

          <div className="flex justify-between items-center pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <Home className="w-3.5 h-3.5" /> Beranda Utama
            </Link>

            <Link
              href="/display"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#0F264A] hover:underline"
            >
              <span>Lihat TV Panggilan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
