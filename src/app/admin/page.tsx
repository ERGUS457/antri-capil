'use client';
import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  ExternalLink,
  QrCode,
  BarChart3,
  LogOut,
  RefreshCw,
  Clock,
  Radio,
  Calendar,
  Filter,
  Search,
  UserCheck,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Megaphone,
} from 'lucide-react';

type Antrean = {
  id: string; nomor: number; tanggal: string; status: string;
  nomorLoket?: number | null;
  warga: { nama: string; nik: string; telepon?: string | null } | null;
  user: { name: string; email: string; nik: string | null; phone?: string | null } | null;
  layanan: { nama: string; kode: string };
};

const LOKET_CONFIG = [
  { id: 1, label: 'Loket 01', title: 'KTP-el', desc: 'Perekaman & Cetak KTP-el' },
  { id: 2, label: 'Loket 02', title: 'KTP & IKD', desc: 'Aktivasi Identitas Digital' },
  { id: 3, label: 'Loket 03', title: 'KK & Pindah', desc: 'Kartu Keluarga & SKPWNI' },
  { id: 4, label: 'Loket 04', title: 'Akta & KIA', desc: 'Kelahiran, Kematian & Anak' },
];

function AdminContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = (session?.user as any)?.role;
  const isAdmin = role === 'ADMIN';

  const [data, setData] = useState<Antrean[]>([]);
  const [filter, setFilter] = useState({ tanggal: '', status: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [myLoket, setMyLoket] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchAntrean = useCallback(async () => {
    if (!isAdmin) return;
    setErr('');
    try {
      const qs = new URLSearchParams();
      if (filter.tanggal) qs.set('tanggal', filter.tanggal);
      if (filter.status) qs.set('status', filter.status);
      const res = await fetch(`/api/antrean?${qs.toString()}`);
      const d = await res.json();
      if (!res.ok) setErr(d.error || 'Gagal memuat data antrean');
      else setData(d.antrean || []);
    } catch (e: any) {
      setErr(e.message || 'Terjadi kesalahan jaringan');
    }
  }, [isAdmin, filter]);

  useEffect(() => {
    if (isAdmin) fetchAntrean();
  }, [isAdmin, fetchAntrean]);

  // Polling realtime 4s agar panel meja petugas selalu sinkron dengan display TV
  useEffect(() => {
    if (!isAdmin) return;
    const iv = setInterval(fetchAntrean, 4000);
    return () => clearInterval(iv);
  }, [isAdmin, fetchAntrean]);

  async function patch(id: string, action: string, loket?: number) {
    setActionLoadingId(id);
    setLoading(true);
    setSuccessMsg('');
    try {
      const bodyPayload: any = { id, action };
      if (action === 'PANGGIL') {
        bodyPayload.nomorLoket = loket || myLoket;
      }
      const res = await fetch('/api/antrean', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });
      const d = await res.json();
      if (!res.ok) {
        setErr(d.error || 'Gagal memperbarui status');
      } else {
        if (action === 'PANGGIL') {
          setSuccessMsg(`Nomor antrean berhasil disiarkan ke Loket 0${loket || myLoket}! Suara panggilan tersiar di layar display.`);
        } else if (action === 'SELESAI') {
          setSuccessMsg(`Pelayanan antrean telah ditandai selesai.`);
        }
        await fetchAntrean();
      }
    } catch (e: any) {
      setErr(e.message || 'Gagal memproses aksi');
    } finally {
      setActionLoadingId(null);
      setLoading(false);
    }
  }

  // Statistik Ringkas Hari Ini
  const stats = useMemo(() => {
    const total = data.length;
    const menunggu = data.filter((d) => d.status === 'MENUNGGU').length;
    const dipanggil = data.filter((d) => d.status === 'DIPANGGIL').length;
    const selesai = data.filter((d) => d.status === 'SELESAI').length;
    const lewati = data.filter((d) => d.status === 'LEWATI').length;
    return { total, menunggu, dipanggil, selesai, lewati };
  }, [data]);

  // Data Terfilter oleh Search Query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase().trim();
    return data.filter((item) => {
      const noStr = String(item.nomor);
      const nama = (item.user?.name || item.warga?.nama || '').toLowerCase();
      const nik = (item.user?.nik || item.warga?.nik || '').toLowerCase();
      const layanan = (item.layanan?.nama || item.layanan?.kode || '').toLowerCase();
      return noStr.includes(q) || nama.includes(q) || nik.includes(q) || layanan.includes(q);
    });
  }, [data, searchQuery]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#070F1E] flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-300">Memverifikasi sesi petugas...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#070F1E] flex items-center justify-center p-6 text-white">
        <div className="bg-[#0A192F] rounded-3xl border border-[#D4AF37]/30 p-8 max-w-md w-full shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] grid place-items-center text-2xl mx-auto shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white mt-4 uppercase tracking-tight">Meja Petugas Loket</h1>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            Halaman ini khusus untuk Operator Loket dan Administrator Dinas Kependudukan dan Pencatatan Sipil Kabupaten Sambas.
          </p>
          <Link
            href="/login?callbackUrl=/admin"
            className="mt-6 inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-[#0A192F] rounded-xl py-3.5 font-black text-sm shadow-lg hover:brightness-110 transition"
          >
            <span>Masuk Akun Petugas →</span>
          </Link>
          <Link href="/" className="inline-block text-xs text-slate-400 hover:text-white mt-4 transition">
            ← Kembali ke Portal Beranda
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#070F1E] flex items-center justify-center p-6 text-white">
        <div className="bg-[#0A192F] rounded-3xl border border-rose-500/30 p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 grid place-items-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <p className="font-black text-lg text-rose-400 uppercase">Akses Tidak Diizinkan</p>
          <p className="text-xs text-slate-300 mt-2">
            Akun <b>{session.user?.email}</b> terdaftar sebagai warga masyarakat dan tidak memiliki otorisasi operasional loket.
          </p>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="mt-6 w-full bg-white/10 hover:bg-white/15 border border-white/20 text-white py-2.5 rounded-xl text-xs font-bold transition"
          >
            Ganti ke Akun Petugas / Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070F1E] text-slate-100 flex flex-col font-sans">
      {/* ========================================================= */}
      {/* TOPBAR: Identitas Petugas & Navigasi Operasional */}
      {/* ========================================================= */}
      <header className="bg-[#0A192F] border-b border-white/10 px-4 sm:px-8 py-3.5 sticky top-0 z-30 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src="/logo-sambas.png"
              alt="Lambang Kabupaten Sambas"
              className="w-10 h-10 object-contain bg-white/10 p-1 rounded-xl border border-white/20 shadow"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase">
                  DISDUKCAPIL KAB. SAMBAS
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-2 py-0.2 rounded-full">
                  LIVE PANEL
                </span>
              </div>
              <h1 className="text-lg font-black text-white tracking-tight uppercase flex items-center gap-2">
                <span>Panel Meja Petugas & Antrean Loket</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap justify-end">
            {/* Display TV Live */}
            <Link
              href="/display"
              target="_blank"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#D4AF37] text-[#0A192F] hover:brightness-110 transition shadow-md"
              title="Buka Layar Display TV Ruang Tunggu"
            >
              <Radio className="w-3.5 h-3.5 text-[#0A192F]" />
              <span>Buka Layar TV ↗</span>
            </Link>

            {/* Scan QR Loket */}
            <Link
              href="/admin/verify"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 transition"
              title="Pindai Tiket QR Warga"
            >
              <QrCode className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden md:inline">Scan QR</span>
            </Link>

            {/* Statistik */}
            <Link
              href="/admin/stats"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 transition"
              title="Statistik Layanan Harian"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Laporan</span>
            </Link>

            {/* Info Petugas & Logout */}
            <div className="h-6 w-px bg-white/15 mx-1 hidden sm:block" />
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white leading-tight">{(session.user as any)?.name}</p>
              <p className="text-[10px] text-slate-400">Petugas Operasional</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 transition"
              title="Keluar dari Panel"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* KONTEN UTAMA */}
      {/* ========================================================= */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 md:p-8 flex-1 space-y-6">
        {/* Banner Alert Notifikasi */}
        {err && (
          <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs px-4 py-3 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{err}</span>
            </div>
            <button onClick={() => setErr('')} className="text-rose-400 hover:text-white text-xs font-bold ml-2">
              Tutup
            </button>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-3 rounded-2xl flex items-center justify-between shadow-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-white text-xs font-bold ml-2">
              Tutup
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 1: PEMILIH LOKET AKTIF PETUGAS */}
        {/* ========================================================= */}
        <section className="bg-[#0A192F] rounded-3xl border border-white/10 p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                <span>PENGATURAN POSISI MEJA KERJA PETUGAS</span>
              </span>
              <h2 className="text-base sm:text-lg font-black text-white mt-1">
                Pilih Loket Layanan yang Sedang Anda Jaga:
              </h2>
            </div>
            <div className="bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold text-[#F5DEB3]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Aktif di: <b>Loket 0{myLoket}</b>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {LOKET_CONFIG.map((l) => {
              const active = myLoket === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => setMyLoket(l.id)}
                  className={`p-3.5 rounded-2xl border text-left transition relative overflow-hidden ${
                    active
                      ? 'bg-gradient-to-br from-[#1E3A8A] to-[#0F264A] border-[#D4AF37] ring-2 ring-[#D4AF37]/50 shadow-lg'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {active && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#D4AF37] ring-4 ring-[#D4AF37]/20" />
                  )}
                  <p className={`text-xs font-black uppercase ${active ? 'text-[#D4AF37]' : 'text-slate-400'}`}>
                    {l.label}
                  </p>
                  <p className="text-sm font-black text-white mt-0.5">{l.title}</p>
                  <p className="text-[10px] text-slate-300 mt-1 truncate">{l.desc}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: STATISTIK COUNTER CEPAT */}
        {/* ========================================================= */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#0A192F] rounded-2xl border border-white/10 p-4 shadow-lg">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Antrean</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl sm:text-3xl font-black text-white">{stats.total}</span>
              <span className="text-xs text-slate-400 font-medium">tiket</span>
            </div>
          </div>

          <div className="bg-[#0A192F] rounded-2xl border border-amber-500/30 p-4 shadow-lg bg-amber-500/5">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Menunggu</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl sm:text-3xl font-black text-amber-300">{stats.menunggu}</span>
              <span className="text-xs text-amber-400/80 font-medium">di ruang tunggu</span>
            </div>
          </div>

          <div className="bg-[#0A192F] rounded-2xl border border-blue-500/30 p-4 shadow-lg bg-blue-500/5">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Sedang Dipanggil</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl sm:text-3xl font-black text-blue-300">{stats.dipanggil}</span>
              <span className="text-xs text-blue-400/80 font-medium">di loket</span>
            </div>
          </div>

          <div className="bg-[#0A192F] rounded-2xl border border-emerald-500/30 p-4 shadow-lg bg-emerald-500/5">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Selesai Dilayani</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl sm:text-3xl font-black text-emerald-300">{stats.selesai}</span>
              <span className="text-xs text-emerald-400/80 font-medium">terlayani</span>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: FILTER, PENCARIAN & TABEL ANTREAN */}
        {/* ========================================================= */}
        <section className="bg-[#0A192F] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          {/* Filter Bar */}
          <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Tanggal */}
              <div className="flex items-center gap-1.5 bg-[#070F1E] border border-white/15 rounded-xl px-3 py-2 text-xs">
                <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                <input
                  type="date"
                  value={filter.tanggal}
                  onChange={(e) => setFilter((s) => ({ ...s, tanggal: e.target.value }))}
                  className="bg-transparent text-white outline-none text-xs"
                />
                {filter.tanggal && (
                  <button
                    onClick={() => setFilter((s) => ({ ...s, tanggal: '' }))}
                    className="text-[10px] text-blue-400 hover:underline font-bold ml-1"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Filter Status */}
              <div className="flex items-center gap-1.5 bg-[#070F1E] border border-white/15 rounded-xl px-3 py-2 text-xs">
                <Filter className="w-3.5 h-3.5 text-[#D4AF37]" />
                <select
                  value={filter.status}
                  onChange={(e) => setFilter((s) => ({ ...s, status: e.target.value }))}
                  className="bg-transparent text-white outline-none text-xs"
                >
                  <option value="" className="bg-[#0A192F] text-white">Semua Status</option>
                  <option value="MENUNGGU" className="bg-[#0A192F] text-white">MENUNGGU</option>
                  <option value="DIPANGGIL" className="bg-[#0A192F] text-white">DIPANGGIL</option>
                  <option value="SELESAI" className="bg-[#0A192F] text-white">SELESAI</option>
                  <option value="LEWATI" className="bg-[#0A192F] text-white">LEWATI</option>
                  <option value="BATAL" className="bg-[#0A192F] text-white">BATAL</option>
                </select>
              </div>

              {/* Tombol Refresh Manual */}
              <button
                onClick={fetchAntrean}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 transition"
                title="Perbarui Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Kotak Pencarian */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari NIK, Nama, atau No. Antrean..."
                className="w-full bg-[#070F1E] border border-white/15 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>
          </div>

          {/* Tabel Antrean */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0F264A] border-b border-white/10 text-slate-300 font-black uppercase tracking-wider text-[10px]">
                  <th className="px-5 py-3.5">No. Antrean</th>
                  <th className="px-5 py-3.5">Layanan</th>
                  <th className="px-5 py-3.5">Warga / Pemohon</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Tindakan Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                      <div className="max-w-xs mx-auto space-y-2">
                        <p className="font-bold text-sm text-slate-300">Tidak ada data antrean</p>
                        <p className="text-[11px] text-slate-400">
                          {searchQuery
                            ? `Tidak ada hasil untuk pencarian "${searchQuery}".`
                            : 'Belum ada antrean terdaftar untuk kriteria filter ini.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((a) => {
                    const isCallingThis = actionLoadingId === a.id;
                    const nama = a.user?.name || a.warga?.nama || 'Tamu Disdukcapil';
                    const nik = a.user?.nik || a.warga?.nik || '-';
                    const telp = a.user?.phone || a.warga?.telepon;

                    return (
                      <tr key={a.id} className="hover:bg-white/[0.03] transition">
                        {/* Kolom Nomor */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-xl font-black text-[#D4AF37] tracking-tight">
                              {a.layanan.kode}-{String(a.nomor).padStart(3, '0')}
                            </span>
                            {a.nomorLoket && (
                              <span className="inline-block text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-md">
                                Loket 0{a.nomorLoket}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Kolom Layanan */}
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-bold text-white text-xs">{a.layanan.nama}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{a.layanan.kode}</p>
                          </div>
                        </td>

                        {/* Kolom Warga */}
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-bold text-slate-100 text-xs">{nama}</p>
                            <p className="text-[10px] text-slate-400">
                              NIK: <span className="font-mono">{nik}</span>
                              {telp && <span> • WA: {telp}</span>}
                            </p>
                          </div>
                        </td>

                        {/* Kolom Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              a.status === 'DIPANGGIL'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 animate-pulse'
                                : a.status === 'MENUNGGU'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : a.status === 'SELESAI'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : a.status === 'LEWATI'
                                ? 'bg-slate-500/20 text-slate-300 border border-slate-500/40'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>

                        {/* Kolom Aksi */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Tombol Panggil Pertama Kali */}
                            {a.status === 'MENUNGGU' && (
                              <button
                                disabled={loading}
                                onClick={() => patch(a.id, 'PANGGIL', myLoket)}
                                className="bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-[#0A192F] px-3.5 py-1.5 rounded-lg text-xs font-black hover:brightness-110 disabled:opacity-50 transition shadow flex items-center gap-1.5"
                                title={`Panggil warga ini ke Loket 0${myLoket}`}
                              >
                                <Megaphone className="w-3.5 h-3.5" />
                                <span>Panggil (Loket 0{myLoket})</span>
                              </button>
                            )}

                            {/* Tombol Panggil Ulang & Selesai bila Sedang Dipanggil */}
                            {a.status === 'DIPANGGIL' && (
                              <>
                                <button
                                  disabled={loading}
                                  onClick={() => patch(a.id, 'PANGGIL', a.nomorLoket || myLoket)}
                                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50 transition shadow flex items-center gap-1"
                                  title="Siarkan ulang panggilan di layar TV"
                                >
                                  <Megaphone className="w-3.5 h-3.5 text-blue-200" />
                                  <span>📢 Panggil Ulang</span>
                                </button>
                                <button
                                  disabled={loading}
                                  onClick={() => patch(a.id, 'SELESAI')}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50 transition shadow flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Selesai</span>
                                </button>
                              </>
                            )}

                            {/* Tombol Lewati */}
                            {(a.status === 'MENUNGGU' || a.status === 'DIPANGGIL') && (
                              <button
                                disabled={loading}
                                onClick={() => patch(a.id, 'LEWATI')}
                                className="bg-white/10 hover:bg-white/15 border border-white/15 text-slate-300 px-2.5 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 transition"
                                title="Lewati bila warga tidak hadir"
                              >
                                Lewati
                              </button>
                            )}

                            {/* Tombol Batalkan */}
                            {(a.status === 'MENUNGGU' || a.status === 'DIPANGGIL') && (
                              <button
                                disabled={loading}
                                onClick={() => patch(a.id, 'BATAL')}
                                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 transition"
                                title="Batalkan antrean"
                              >
                                Batal
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Footer Hak Cipta */}
      <footer className="py-4 text-center text-[11px] text-slate-500 border-t border-white/5 bg-[#0A192F]">
        <p>Sistem Antrean Disdukcapil Kabupaten Sambas (ANTRI-CAPIL) • Meja Petugas Operasional</p>
      </footer>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070F1E] flex items-center justify-center text-white">
          Memuat Panel Petugas...
        </div>
      }
    >
      <AdminContent />
    </Suspense>
  );
}
