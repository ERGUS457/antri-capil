'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  CreditCard,
  Users,
  Baby,
  Home as HomeIcon,
  FileText,
  Calendar,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
} from 'lucide-react';

const layananOptions = [
  {
    kode: 'KTP',
    label: 'KTP Elektronik',
    desc: 'Perekaman baru & penggantian',
    Icon: CreditCard,
    loket: 'Loket 01-02',
  },
  {
    kode: 'KK',
    label: 'Kartu Keluarga',
    desc: 'Penerbitan baru & perubahan',
    Icon: Users,
    loket: 'Loket 03',
  },
  {
    kode: 'KIA',
    label: 'KIA (Kartu Anak)',
    desc: 'Identitas anak 0-17 thn',
    Icon: Baby,
    loket: 'Loket 04',
  },
  {
    kode: 'PINDAH',
    label: 'Surat Pindah (SKPWNI)',
    desc: 'Mutasi kependudukan',
    Icon: HomeIcon,
    loket: 'Loket 03',
  },
  {
    kode: 'AKTA',
    label: 'Akta Capil',
    desc: 'Kelahiran, Kematian, Nikah',
    Icon: FileText,
    loket: 'Loket 04',
  },
];

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryLayanan = searchParams.get('layanan');

  const { data: session, status } = useSession();
  const user = session?.user as any;
  const isAuthed = status === 'authenticated' && !!user;

  // Tanggal default: Besok
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const [form, setForm] = useState({
    layananKode: queryLayanan || 'KTP',
    tanggal: tomorrow,
    nik: '',
    nama: '',
    telepon: '',
    email: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [kuota, setKuota] = useState<{ sisa: number; jumlah: number; penuh: boolean } | null>(null);

  // Sync session jika user login
  useEffect(() => {
    if (isAuthed) {
      setForm((prev) => ({
        ...prev,
        nik: user?.nik || prev.nik,
        nama: user?.name || prev.nama,
        email: user?.email || prev.email,
        telepon: user?.phone || prev.telepon,
      }));
    }
  }, [isAuthed, user]);

  // Cek kuota realtime
  useEffect(() => {
    async function fetchKuota() {
      const { layananKode, tanggal } = form;
      if (!layananKode || !tanggal) {
        setKuota(null);
        return;
      }
      try {
        const res = await fetch(`/api/kuota?layananKode=${layananKode}&tanggal=${tanggal}`);
        const data = await res.json();
        setKuota(data);
      } catch (err) {
        setKuota(null);
      }
    }
    fetchKuota();
  }, [form.layananKode, form.tanggal]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.tanggal) {
      setError('Pilih tanggal kunjungan.');
      return;
    }

    if (!isAuthed) {
      const cleanNik = form.nik.replace(/\D/g, '');
      if (cleanNik.length !== 16) {
        setError('NIK harus terdiri dari 16 digit angka sesuai KTP/KK.');
        return;
      }
      if (!form.nama.trim() || form.nama.trim().length < 3) {
        setError('Masukkan nama lengkap pemohon.');
        return;
      }
      if (!form.telepon.trim() || form.telepon.trim().length < 8) {
        setError('Nomor WhatsApp aktif wajib diisi untuk verifikasi pemanggilan.');
        return;
      }
    }

    if (kuota?.penuh) {
      setError('Kuota harian layanan ini telah penuh pada tanggal yang dipilih.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          layananKode: form.layananKode,
          tanggal: form.tanggal,
          nik: form.nik,
          nama: form.nama,
          telepon: form.telepon,
          email: form.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mendaftar antrean.');

      // Langsung arahkan ke halaman tiket digital QR
      router.push(`/tiket/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Form */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0A192F] mb-3 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Kembali ke Beranda
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#997300] px-3 py-0.5 rounded-full text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Fast-Track Layanan Publik
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] tracking-tight">
              Pendaftaran Antrean Mandiri
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {isAuthed
                ? `Booking langsung menggunakan profil terdaftar Anda (${user?.name}).`
                : 'Cukup isi NIK dan nomor WhatsApp aktif. Tanpa perlu registrasi akun atau password.'}
            </p>
          </div>
        </div>
      </div>

      {/* Card Utama */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden">
        {/* Banner Status Akun */}
        {isAuthed ? (
          <div className="bg-[#0A192F] text-white px-6 py-4 flex items-center justify-between border-b border-[#1E293B]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#D4AF37] text-[#0A192F] grid place-items-center font-bold text-sm">
                {(user?.name?.[0] || 'U').toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-slate-300 font-medium">Akun Terdaftar</p>
                <p className="text-sm font-bold text-white leading-tight">{user?.name}</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Data Tersinkron
            </span>
          </div>
        ) : (
          <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Mode Tamu (Guest Fast-Track) Aktif
            </span>
            <Link href="/login" className="text-[#0F264A] font-bold hover:underline">
              Punya Akun? Masuk Disini →
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-sm px-4 py-3 rounded-xl">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: PILIH LAYANAN */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Langkah 1: Pilih Jenis Layanan Kependudukan
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {layananOptions.map((opt) => {
                const isSelected = form.layananKode === opt.kode;
                return (
                  <button
                    key={opt.kode}
                    type="button"
                    onClick={() => setForm((s) => ({ ...s, layananKode: opt.kode }))}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-[#0A192F] bg-[#0A192F]/5 ring-2 ring-[#0A192F]/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg grid place-items-center shrink-0 ${
                        isSelected ? 'bg-[#0A192F] text-[#D4AF37]' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <opt.Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-sm text-[#0A192F]">{opt.label}</span>
                        <span className="text-[10px] font-mono text-slate-500 font-semibold">
                          {opt.loket}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: PILIH TANGGAL & KUOTA */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Langkah 2: Pilih Tanggal Rencana Kunjungan
            </label>
            <div className="grid sm:grid-cols-2 gap-4 items-center">
              <div className="relative">
                <input
                  type="date"
                  value={form.tanggal}
                  min={tomorrow}
                  onChange={(e) => setForm((s) => ({ ...s, tanggal: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:bg-white transition"
                  required
                />
              </div>

              {/* Status Kuota Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500">Ketersediaan Kuota</p>
                  <p className="text-sm font-bold text-slate-900">
                    {kuota ? `${kuota.sisa} dari ${kuota.jumlah} kuota` : 'Memeriksa kuota...'}
                  </p>
                </div>
                {kuota && (
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      kuota.penuh
                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}
                  >
                    {kuota.penuh ? 'Penuh' : 'Tersedia'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* STEP 3: DATA IDENTITAS PEMOHON */}
          <div className="pt-2 border-t border-slate-200">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Langkah 3: Identitas Pemohon
            </label>

            <div className="space-y-4">
              {/* NIK */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nomor Induk Kependudukan (NIK) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    maxLength={16}
                    value={form.nik}
                    placeholder="Contoh: 6101012304950001 (16 digit)"
                    onChange={(e) =>
                      setForm((s) => ({ ...s, nik: e.target.value.replace(/\D/g, '') }))
                    }
                    disabled={isAuthed && !!user?.nik}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:bg-white disabled:bg-slate-100 disabled:text-slate-500 transition"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  NIK pemohon akan diverifikasi saat hadir di meja loket pelayanan.
                </p>
              </div>

              {/* Nama Lengkap & WhatsApp */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nama Lengkap (Sesuai KTP) *
                  </label>
                  <input
                    type="text"
                    value={form.nama}
                    placeholder="Nama Lengkap Pemohon"
                    onChange={(e) => setForm((s) => ({ ...s, nama: e.target.value }))}
                    disabled={isAuthed && !!user?.name}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:bg-white disabled:bg-slate-100 disabled:text-slate-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nomor WhatsApp / HP Aktif *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="tel"
                      value={form.telepon}
                      placeholder="Contoh: 08123456789"
                      onChange={(e) =>
                        setForm((s) => ({ ...s, telepon: e.target.value.replace(/[^\d+]/g, '') }))
                      }
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:bg-white transition"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email (Opsional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Alamat Email (Opsional - untuk salinan E-Tiket PDF)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    value={form.email}
                    placeholder="nama@email.com (opsional)"
                    onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                    disabled={isAuthed && !!user?.email}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:bg-white disabled:bg-slate-100 disabled:text-slate-500 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-4">
            <button
              disabled={loading || kuota?.penuh}
              type="submit"
              className="w-full bg-gradient-to-r from-[#D4AF37] via-[#E5BA42] to-[#D4AF37] text-[#0A192F] font-extrabold text-base py-4 rounded-xl shadow-lg hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-[#0A192F]" />
              <span>{loading ? 'Menerbitkan Tiket Antrean...' : 'Terbitkan Tiket Antrean Sekarang'}</span>
            </button>
            <p className="text-center text-xs text-slate-500 mt-2.5">
              Dengan mengklik tombol, Anda menyetujui jadwal kehadiran pelayanan Disdukcapil Sambas.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      <Suspense fallback={<div className="p-12 text-center text-slate-500">Memuat formulir...</div>}>
        <BookingForm />
      </Suspense>
    </div>
  );
}
