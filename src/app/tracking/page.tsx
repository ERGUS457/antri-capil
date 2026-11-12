'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  Search,
  Ticket,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Building2,
  RefreshCw,
} from 'lucide-react';

type AntreanItem = {
  id: string;
  nomor: number;
  tanggal: string;
  status: string;
  nomorLoket?: number | null;
  nama: string;
  maskedNik: string;
  layanan: {
    id: string;
    kode: string;
    nama: string;
    deskripsi?: string;
  };
};

export default function TrackingPage() {
  const [nik, setNik] = useState('');
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<AntreanItem[] | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const cleanNik = nik.trim();
    if (!cleanNik || cleanNik.length < 10) {
      setError('Masukkan minimal 10 sampai 16 digit NIK');
      return;
    }
    setError('');
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/antrean?nik=${encodeURIComponent(cleanNik)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal mencari tiket antrean');
        setTickets([]);
      } else {
        setTickets(data.tickets || []);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan koneksi');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Header Section */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 bg-[#0A192F]/5 border border-[#0A192F]/10 text-[#0F264A] px-3.5 py-1.5 rounded-full text-xs font-bold mb-3">
            <Search className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Pencarian Tiket Terbuka</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0A192F] tracking-tight">
            Lacak Status Tiket Antrean
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Cukup masukkan Nomor Induk Kependudukan (NIK) 16 digit pemohon untuk melihat status panggilan langsung tanpa perlu login.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xl shadow-slate-200/50 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="nikInput" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Nomor Induk Kependudukan (NIK)
              </label>
              <div className="relative">
                <input
                  id="nikInput"
                  type="text"
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                  placeholder="Contoh: 610101xxxxxxxxxx"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 pl-11 text-sm sm:text-base font-mono font-medium focus:ring-2 focus:ring-[#0A192F] focus:outline-none transition"
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                {nik && (
                  <span className="absolute right-3.5 top-3.5 text-xs font-mono text-slate-400">
                    {nik.length}/16
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || nik.length < 10}
              className="w-full bg-gradient-to-r from-[#0A192F] to-[#0F264A] text-white py-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#0A192F]/20 hover:brightness-110 active:scale-[0.99] disabled:opacity-50 transition"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  <span>Mencari Data Antrean...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-[#D4AF37]" />
                  <span>Cek Status Antrean Sekarang</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {searched && !loading && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#D4AF37]" />
              <span>Hasil Pencarian ({tickets?.length || 0} Tiket)</span>
            </h2>

            {tickets && tickets.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {tickets.map((t) => {
                  const kodeNomor = `${t.layanan.kode}-${String(t.nomor).padStart(3, '0')}`;
                  const tglStr = new Date(t.tanggal).toLocaleDateString('id-ID', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={t.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-[#0A192F] transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <span className="text-xs font-mono font-bold text-slate-600">
                            {t.maskedNik}
                          </span>
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                              t.status === 'DIPANGGIL'
                                ? 'bg-emerald-500 text-white animate-pulse'
                                : t.status === 'SELESAI'
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {t.status === 'DIPANGGIL'
                              ? `LOKET ${t.nomorLoket || '01'}`
                              : t.status}
                          </span>
                        </div>

                        <div className="mt-3 flex items-baseline justify-between">
                          <div>
                            <span className="text-2xl font-black font-mono text-[#0A192F]">
                              {kodeNomor}
                            </span>
                            <p className="text-xs font-bold text-slate-800 mt-0.5">
                              {t.layanan.nama}
                            </p>
                          </div>
                          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {tglStr}
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-slate-500">
                          Nama Pemohon: <span className="font-semibold text-slate-800">{t.nama}</span>
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Disdukcapil Sambas
                        </span>
                        <Link
                          href={`/tiket/${t.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#0F264A] hover:text-[#D4AF37] transition"
                        >
                          <span>Buka Smart Ticket</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                <Ticket className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800">
                  Tidak Ada Tiket Antrean Ditemukan
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Pastikan 16 digit NIK yang dimasukkan sesuai dengan pendaftaran. Jika belum mendaftar, silakan ambil tiket baru.
                </p>
                <div className="mt-5">
                  <Link
                    href="/booking"
                    className="inline-flex items-center gap-2 bg-[#0A192F] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#0F264A] transition"
                  >
                    <Ticket className="w-4 h-4 text-[#D4AF37]" />
                    <span>Ambil Antrean Baru</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}