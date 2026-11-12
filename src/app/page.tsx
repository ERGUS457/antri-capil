import Link from "next/link";
import Navbar from "@/components/Navbar";
import TiketPreview from "@/components/TiketPreview";
import {
  CreditCard,
  Users,
  Baby,
  Home as HomeIcon,
  FileText,
  Clock,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Search,
  Monitor,
  PhoneCall,
  QrCode,
} from "lucide-react";

const layanan = [
  {
    kode: "KTP",
    nama: "KTP Elektronik",
    desc: "Perekaman biometrik baru, penggantian KTP rusak/hilang, & aktivasi IKD.",
    Icon: CreditCard,
    accent: "from-blue-600 to-indigo-600",
    border: "border-blue-500/20",
    badge: "Loket 01 - 02",
  },
  {
    kode: "KK",
    nama: "Kartu Keluarga",
    desc: "Penerbitan KK baru, penambahan anggota keluarga, pecah KK, & cetak ulang.",
    Icon: Users,
    accent: "from-emerald-600 to-teal-600",
    border: "border-emerald-500/20",
    badge: "Loket 03",
  },
  {
    kode: "KIA",
    nama: "KIA (Kartu Identitas Anak)",
    desc: "Identitas kependudukan resmi untuk anak usia 0 sampai dengan 17 tahun kurang satu hari.",
    Icon: Baby,
    accent: "from-amber-500 to-orange-500",
    border: "border-amber-500/20",
    badge: "Loket 04",
  },
  {
    kode: "PINDAH",
    nama: "Surat Pindah (SKPWNI)",
    desc: "Layanan kepindahan domisili kependudukan antar-desa, kecamatan, maupun luar daerah.",
    Icon: HomeIcon,
    accent: "from-purple-600 to-indigo-600",
    border: "border-purple-500/20",
    badge: "Loket 03",
  },
  {
    kode: "AKTA",
    nama: "Akta Pencatatan Sipil",
    desc: "Penerbitan kutipan Akta Kelahiran, Akta Kematian, serta Akta Perkawinan non-muslim.",
    Icon: FileText,
    accent: "from-rose-600 to-pink-600",
    border: "border-rose-500/20",
    badge: "Loket 04",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#D4AF37]/30 selection:text-[#0A192F]">
      <Navbar />

      {/* HERO SECTION — Modern Gov-Tech with Royal Navy & Gold */}
      <section className="relative bg-gradient-to-b from-[#0A192F] via-[#0F264A] to-[#0A192F] text-white pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden border-b border-[#1E293B]">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Fast Track Booking */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge Lembaga */}
              <div className="inline-flex items-center gap-2.5 bg-white/10 border border-white/15 text-slate-200 px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[#D4AF37] font-bold">Layanan Resmi</span>
                <span className="text-white/40">•</span>
                <span>Disdukcapil Kabupaten Sambas</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black tracking-tight leading-[1.1] text-white">
                Sistem Antrean Digital <br className="hidden sm:block" />
                Pelayanan Adminduk <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F3C350] to-[#FFF0B3]">
                  Tertib, Cepat & Pasti
                </span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
                Pilih layanan kependudukan Anda, masukkan identitas pemohon, dan dapatkan 
                <span className="text-white font-semibold"> Smart Ticket QR</span> seketika. Pantau panggilan 
                langsung dari smartphone tanpa antre menumpuk di kantor dinas.
              </p>

              {/* Fast Action CTA Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  href="/booking"
                  className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#D4AF37] via-[#E5BA42] to-[#D4AF37] text-[#0A192F] px-7 py-4 rounded-xl font-extrabold text-base shadow-xl shadow-[#D4AF37]/20 hover:brightness-110 active:scale-[0.98] transition-all group"
                >
                  <Sparkles className="w-5 h-5 text-[#0A192F]" />
                  <span>Ambil Tiket Antrean (Instan)</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/tracking"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 px-6 py-4 rounded-xl font-bold text-sm backdrop-blur-md transition-all"
                >
                  <Search className="w-4 h-4 text-[#D4AF37]" />
                  <span>Cek Tiket via NIK</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 grid grid-cols-3 gap-3 border-t border-white/10 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Tanpa Wajib Password</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Tiket Digital QR Resmi</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Audio Panggilan Suara</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Smart Ticket Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md">
                <TiketPreview />

                {/* Live Status indicator beneath ticket */}
                <div className="mt-4 flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3 backdrop-blur-md text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-[#D4AF37]" />
                    <span>Layar Panggilan Aktif</span>
                  </div>
                  <Link
                    href="/display"
                    className="text-[#D4AF37] font-bold hover:underline flex items-center gap-1"
                  >
                    Buka Display TV →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ALUR: 4 Langkah Sangat Mudah */}
      <section className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F264A] bg-[#0A192F]/5 px-3 py-1 rounded-full border border-[#0A192F]/10">
              Alur Pelayanan Baru
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#0A192F] tracking-tight">
              4 Langkah Mudah Urus Adminduk
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Dirancang ringkas agar warga dari segala usia dapat mengurus dokumen kependudukan secara mandiri.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Pilih Jenis Layanan",
                desc: "Tentukan keperluan Anda: KTP-el, KK, KIA, Akta Capil, atau Surat Pindah.",
                icon: FileText,
              },
              {
                step: "02",
                title: "Isi NIK & Kontak",
                desc: "Cukup masukkan 16 digit NIK dan nomor WhatsApp aktif. Tanpa pusing akun/password.",
                icon: Smartphone,
              },
              {
                step: "03",
                title: "Simpan Tiket QR",
                desc: "Tiket digital berisi barcode unik otomatis dibuat dan siap disimpan ke galeri ponsel.",
                icon: QrCode,
              },
              {
                step: "04",
                title: "Datang & Tunjukkan QR",
                desc: "Hadir tepat waktu di Disdukcapil Sambas. Pantau nomor loket di layar display publik.",
                icon: Clock,
              },
            ].map((s) => (
              <div
                key={s.step}
                className="relative bg-slate-50 border border-slate-200/80 rounded-2xl p-6 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0A192F] text-[#D4AF37] grid place-items-center font-bold text-lg group-hover:scale-105 transition-transform">
                    <s.icon className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-2xl font-black text-slate-300 group-hover:text-[#D4AF37] transition-colors">
                    {s.step}
                  </span>
                </div>
                <h3 className="font-bold text-base text-[#0A192F]">{s.title}</h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DAFTAR LAYANAN */}
      <section id="layanan" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] bg-[#0A192F] px-3 py-1 rounded-full">
                Katalog Layanan
              </span>
              <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#0A192F] tracking-tight">
                Pilih Dokumen yang Ingin Diurus
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Pendaftaran kuota buka setiap hari kerja dengan batas harian optimal untuk kenyamanan bersama.
              </p>
            </div>

            <Link
              href="/booking"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#0F264A] hover:text-[#D4AF37] transition"
            >
              <span>Booking Antrean Langsung</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {layanan.map((l) => (
              <div
                key={l.kode}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-[#0F264A] hover:shadow-xl transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#0A192F] text-[#D4AF37] grid place-items-center shadow-sm">
                      <l.Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold font-mono tracking-wider bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                      {l.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold font-mono text-[#D4AF37] bg-[#0A192F] px-2 py-0.5 rounded">
                      {l.kode}
                    </span>
                    <h3 className="font-extrabold text-lg text-[#0A192F] group-hover:text-blue-900 transition">
                      {l.nama}
                    </h3>
                  </div>

                  <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                    {l.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Kuota Tersedia
                  </span>
                  <Link
                    href={`/booking?layanan=${l.kode}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0A192F] hover:text-[#D4AF37] group-hover:translate-x-0.5 transition"
                  >
                    <span>Ambil Tiket</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALLOUT BANNER / FOOTER */}
      <section className="bg-[#0A192F] text-white py-12 border-t border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-[#0F264A] to-[#0A192F] border border-[#1E3A8A] rounded-2xl p-6 sm:p-8">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Memiliki Pertanyaan atau Kendala Berkas?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Kunjungi Loket Informasi & Pengaduan Disdukcapil Kabupaten Sambas pada jam kerja.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/tracking"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition"
              >
                <Search className="w-4 h-4 text-[#D4AF37]" />
                <span>Lacak Tiket Anda</span>
              </Link>
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#F3C350] text-[#0A192F] font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl transition"
              >
                <span>Daftar Antrean Sekarang</span>
              </Link>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo-sambas.png" alt="Kabupaten Sambas" className="w-6 h-6 object-contain" />
              <span>Dinas Kependudukan dan Pencatatan Sipil Kabupaten Sambas</span>
            </div>
            <p>© {new Date().getFullYear()} ANTRI-CAPIL Sambas. Pelayanan Berintegritas & Modern.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
