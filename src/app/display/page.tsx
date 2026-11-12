'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Radio,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  Building2,
  ExternalLink,
  ChevronRight,
  Headphones,
} from 'lucide-react';

type Antrean = {
  id: string;
  nomor: number;
  status: string;
  nomorLoket?: number | null;
  waktuPanggil?: string | null;
  layanan: {
    kode: string;
    nama: string;
  };
};

// Pemetaan loket default berdasarkan layanan adminduk
const LOKET_CONFIG = [
  { nomor: 1, nama: 'Loket 01', fokus: 'KTP Elektronik', layananKode: 'KTP' },
  { nomor: 2, nama: 'Loket 02', fokus: 'KTP-el & IKD Digital', layananKode: 'KTP' },
  { nomor: 3, nama: 'Loket 03', fokus: 'KK & Surat Pindah', layananKode: 'KK' },
  { nomor: 4, nama: 'Loket 04', fokus: 'Akta Capil & KIA', layananKode: 'AKTA' },
];

export default function DisplayPage() {
  const [activeList, setActiveList] = useState<Antrean[]>([]);
  const [waitingList, setWaitingList] = useState<Antrean[]>([]);
  const [lastFetched, setLastFetched] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastSpokenTicketId, setLastSpokenTicketId] = useState<string | null>(null);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Update digital clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Web Audio API: 3-tone Airport/Government Chime (D5 -> F#5 -> A5)
  const playChime = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const notes = [587.33, 739.99, 880.0]; // D5, F#5, A5
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.18);

        // Smooth volume envelope
        gain.gain.setValueAtTime(0, now + idx * 0.18);
        gain.gain.linearRampToValueAtTime(0.28, now + idx * 0.18 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.18);
        osc.stop(now + idx * 0.18 + 0.48);
      });
    } catch (err) {
      console.warn('Audio Chime error:', err);
    }
  }, []);

  // Format kode nomor antrean dieja agar pelafalan jelas
  // Misal KTP-001 -> "K... T... P... nol... nol... satu"
  const formatSpeechNumber = (kode: string, nomor: number) => {
    const spelledKode = kode.split('').join(' ');
    const numStr = String(nomor).padStart(3, '0');
    const spelledDigits = numStr
      .split('')
      .map((d) => {
        switch (d) {
          case '0':
            return 'nol';
          case '1':
            return 'satu';
          case '2':
            return 'dua';
          case '3':
            return 'tiga';
          case '4':
            return 'empat';
          case '5':
            return 'lima';
          case '6':
            return 'enam';
          case '7':
            return 'tujuh';
          case '8':
            return 'delapan';
          case '9':
            return 'sembilan';
          default:
            return d;
        }
      })
      .join(' ');

    return `${spelledKode}... ${spelledDigits}`;
  };

  // Text-To-Speech pengumuman panggilan antrean resmi
  const speakPanggilan = useCallback(
    (ticket: Antrean) => {
      if (!('speechSynthesis' in window)) return;

      // Putar chime bel terlebih dahulu
      playChime();

      setTimeout(() => {
        try {
          window.speechSynthesis.cancel(); // batalkan suara sebelumnya yang belum tuntas

          const loketNum = ticket.nomorLoket || 1;
          const speechCode = formatSpeechNumber(ticket.layanan.kode, ticket.nomor);
          const text = `Nomor antrean... ${speechCode}... Silakan menuju ke Loket ${loketNum}.`;

          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'id-ID';
          utterance.rate = 0.88; // Sedikit lebih santai agar sangat jelas terdengar di aula TV
          utterance.pitch = 1.05;

          // Cari voice Indonesia jika ada
          const voices = window.speechSynthesis.getVoices();
          const idVoice = voices.find((v) => v.lang.includes('id') || v.lang.includes('ID'));
          if (idVoice) utterance.voice = idVoice;

          utterance.onstart = () => setIsSpeaking(true);
          utterance.onend = () => setIsSpeaking(false);
          utterance.onerror = () => setIsSpeaking(false);

          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.warn('Speech synthesis error:', err);
          setIsSpeaking(false);
        }
      }, 700); // jeda 700ms setelah bel pembuka
    },
    [playChime]
  );

  // Uji coba manual audio
  const handleTestAudio = () => {
    setAudioEnabled(true);
    speakPanggilan({
      id: 'test-demo',
      nomor: 18,
      status: 'DIPANGGIL',
      nomorLoket: 2,
      layanan: { kode: 'KTP', nama: 'KTP Elektronik' },
    });
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Fetch antrean aktif & menunggu secara periodik (polling realtime)
  const fetchAntrean = useCallback(async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const [resDipanggil, resMenunggu] = await Promise.all([
        fetch(`/api/antrean?tanggal=${today}&status=DIPANGGIL`),
        fetch(`/api/antrean?tanggal=${today}&status=MENUNGGU`),
      ]);

      const dataDipanggil = await resDipanggil.json();
      const dataMenunggu = await resMenunggu.json();

      const dipanggilArr: Antrean[] = dataDipanggil.antrean || [];
      const menungguArr: Antrean[] = dataMenunggu.antrean || [];

      setActiveList(dipanggilArr);
      setWaitingList(menungguArr);
      setLastFetched(new Date());

      // Auto-trigger audio jika ada panggilan baru yang belum disuarakan
      if (dipanggilArr.length > 0) {
        // Ambil tiket yang paling terakhir dipanggil (berdasarkan waktuPanggil atau urutan terakhir)
        const newestCalled = dipanggilArr[dipanggilArr.length - 1];
        if (newestCalled && newestCalled.id !== lastSpokenTicketId) {
          setLastSpokenTicketId(newestCalled.id);
          if (audioEnabled) {
            speakPanggilan(newestCalled);
          }
        }
      }
    } catch (err) {
      console.error('Display fetch error:', err);
    }
  }, [audioEnabled, lastSpokenTicketId, speakPanggilan]);

  // Initial fetch and 4s interval polling
  useEffect(() => {
    fetchAntrean();
    const interval = setInterval(fetchAntrean, 4000);
    return () => clearInterval(interval);
  }, [fetchAntrean]);

  // Tiket yang sedang menjadi highlight panggilan utama
  const primaryCall = activeList.length > 0 ? activeList[activeList.length - 1] : null;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#0A192F] text-white font-sans flex flex-col justify-between selection:bg-[#D4AF37]/30">
      {/* ========================================================= */}
      {/* HEADER BAR: Identitas Resmi Disdukcapil Sambas & Jam Digital */}
      {/* ========================================================= */}
      <header className="w-full bg-[#0F264A] border-b border-[#1E3A8A]/60 px-4 sm:px-8 py-3.5 sm:py-4 shadow-xl z-20">
        <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Judul Instansi */}
          <div className="flex items-center gap-3.5 sm:gap-4 shrink-0">
            <div className="relative">
              <img
                src="/logo-sambas.png"
                alt="Lambang Kabupaten Sambas"
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain bg-white/10 p-1 rounded-xl border border-white/20 shadow-lg drop-shadow"
              />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-[#0F264A] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-extrabold tracking-widest text-[#D4AF37] uppercase">
                  PEMERINTAH KABUPATEN SAMBAS
                </span>
                <span className="hidden sm:inline-block bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                  LIVE SYNC
                </span>
              </div>
              <h1 className="text-base sm:text-xl md:text-2xl font-black text-white tracking-tight uppercase">
                DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-300 font-medium">
                Papan Layar Antrean Digital Pelayanan Publik Terpadu (ANTRI-CAPIL)
              </p>
            </div>
          </div>

          {/* Jam Digital WIB & Tanggal Masehi */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-right border-r border-white/15 pr-4 sm:pr-6 hidden sm:block">
              <p className="text-xs font-semibold text-slate-300">
                {currentTime.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <div className="flex items-center justify-end gap-1.5 font-mono text-2xl sm:text-3xl font-black text-[#F3C350] tracking-wider">
                <span>
                  {currentTime.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
                <span className="text-xs text-slate-400 font-sans font-bold">WIB</span>
              </div>
            </div>

            {/* Kontrol TV (Audio, Fullscreen, Test Voice) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAudioEnabled((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition shadow-md ${
                  audioEnabled
                    ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50 hover:bg-emerald-600/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                }`}
                title={audioEnabled ? 'Audio Suara Aktif' : 'Audio Suara Nonaktif'}
              >
                {audioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
                <span className="hidden md:inline">{audioEnabled ? 'Suara ON' : 'Suara MUTE'}</span>
              </button>

              <button
                onClick={handleTestAudio}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#D4AF37]/20 text-[#F5DEB3] border border-[#D4AF37]/40 hover:bg-[#D4AF37]/30 transition shadow-md"
                title="Uji coba speaker pengeras suara"
              >
                <Headphones className="w-4 h-4 text-[#D4AF37]" />
                <span className="hidden lg:inline">Tes Suara</span>
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-slate-200 transition shadow-md"
                title="Layar Penuh (Fullscreen)"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Banner Notifikasi Autoplay Audio jika belum aktif */}
      {!audioEnabled && (
        <div
          onClick={() => {
            setAudioEnabled(true);
            playChime();
          }}
          className="bg-gradient-to-r from-amber-600/90 via-amber-500/90 to-amber-600/90 text-[#0A192F] py-2.5 px-4 text-center text-xs sm:text-sm font-extrabold cursor-pointer hover:brightness-105 transition flex items-center justify-center gap-2 shadow-lg z-10"
        >
          <Volume2 className="w-4 h-4 animate-bounce" />
          <span>Klik di sini untuk mengaktifkan Suara Panggilan Otomatis Ruang Tunggu Disdukcapil</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* MAIN VIEWPORT: Split Hero Panggilan & Waiting Queue       */}
      {/* ========================================================= */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto p-4 sm:p-6 lg:p-8 grid lg:grid-cols-12 gap-6 items-stretch">
        {/* Sisi Kiri: HERO Panggilan Aktif & Grid 4 Loket Pelayanan (8 Kolom) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* HERO CARD: PANGGILAN TERKINI */}
          <div className="relative bg-gradient-to-br from-[#0F264A] via-[#112F5D] to-[#0A192F] rounded-3xl border-2 border-[#D4AF37]/60 p-6 sm:p-8 lg:p-10 shadow-2xl overflow-hidden flex flex-col justify-between">
            {/* Ambient Background Glow */}
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Bar Card */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 bg-emerald-400 rounded-full animate-ping" />
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#D4AF37]">
                  PANGGILAN AKTIF SEKARANG
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isSpeaking && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full animate-pulse">
                    <Radio className="w-3.5 h-3.5" /> SUARA BERBUNYI...
                  </span>
                )}
                <span className="text-xs font-semibold text-slate-300">
                  Update: {lastFetched.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Nomor Antrean Jumbo & Loket Tujuan */}
            <div className="my-6 sm:my-8 text-center relative z-10">
              {primaryCall ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Badge Layanan */}
                  <div className="inline-flex items-center gap-2 bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F5DEB3] px-4 sm:px-6 py-2 rounded-2xl text-sm sm:text-lg font-bold shadow-sm">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
                    <span>{primaryCall.layanan.nama}</span>
                  </div>

                  {/* Jumbo Ticket Number */}
                  <div className="font-mono font-black text-6xl sm:text-8xl md:text-9xl lg:text-[120px] text-white tracking-tight drop-shadow-[0_10px_35px_rgba(212,175,55,0.35)]">
                    {primaryCall.layanan.kode}-{String(primaryCall.nomor).padStart(3, '0')}
                  </div>

                  {/* Loket Callout Box */}
                  <div className="inline-block bg-gradient-to-r from-[#D4AF37] via-[#F3C350] to-[#D4AF37] text-[#0A192F] px-8 sm:px-14 py-3 sm:py-4 rounded-2xl shadow-xl shadow-[#D4AF37]/30 transform hover:scale-105 transition-transform">
                    <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#0A192F]/80">
                      SILAKAN MENUJU KE
                    </p>
                    <p className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight">
                      LOKET {String(primaryCall.nomorLoket || 1).padStart(2, '0')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-12 sm:py-16 space-y-4">
                  <Clock className="w-16 h-16 sm:w-20 sm:h-20 text-slate-500 mx-auto animate-pulse" />
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-200 uppercase tracking-tight">
                    MENUNGGU PANGGILAN ANTREAN
                  </h3>
                  <p className="text-sm text-slate-400 max-w-md mx-auto">
                    Petugas loket akan segera memanggil nomor antrean berikutnya. Mohon warga memperhatikan layar dan pengeras suara.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Info Bar */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2 relative z-10">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#D4AF37]" />
                <span>Ruang Pelayanan Disdukcapil Kab. Sambas</span>
              </span>
              <span className="text-slate-400">
                Panggilan otomatis didukung Web Speech Audio System
              </span>
            </div>
          </div>

          {/* GRID MULTI-LOKET (4 LOKET PELAYANAN) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 flex-1">
            {LOKET_CONFIG.map((loket) => {
              // Cari antrean aktif di loket ini
              const ticketAtLoket = activeList.find((a) => a.nomorLoket === loket.nomor);
              const isActive = !!ticketAtLoket;

              return (
                <div
                  key={loket.nomor}
                  className={`rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between ${
                    isActive
                      ? 'bg-gradient-to-b from-[#0F264A] to-[#1E3A8A] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/15'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="font-extrabold text-sm sm:text-base text-white">
                      {loket.nama}
                    </span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                      }`}
                    />
                  </div>

                  <div className="my-3 text-center">
                    {isActive ? (
                      <div>
                        <span className="text-xs font-bold text-[#D4AF37]">
                          {ticketAtLoket.layanan.kode}
                        </span>
                        <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                          {ticketAtLoket.layanan.kode}-{String(ticketAtLoket.nomor).padStart(3, '0')}
                        </div>
                        <span className="mt-1 inline-block text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          SEDANG DILAYANI
                        </span>
                      </div>
                    ) : (
                      <div className="py-2">
                        <span className="text-slate-400 text-xs font-semibold block">
                          Siap Melayani
                        </span>
                        <span className="text-xl font-mono text-slate-500 font-bold block mt-1">
                          ---
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 font-medium text-center truncate">
                    {loket.fokus}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sisi Kanan: ANTREAN BERIKUTNYA & QR SMARTPHONE BOOKING (4 Kolom) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Card Antrean Berikutnya */}
          <div className="bg-[#0F264A] rounded-3xl border border-[#1E3A8A] p-5 sm:p-6 shadow-xl flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h2 className="text-sm sm:text-base font-extrabold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Antrean Berikutnya</span>
              </h2>
              <span className="text-xs font-bold bg-white/10 text-slate-200 px-2.5 py-0.5 rounded-full">
                {waitingList.length} Menunggu
              </span>
            </div>

            {/* List Waiting */}
            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
              {waitingList.length === 0 ? (
                <div className="h-44 grid place-items-center text-center text-slate-400 text-xs">
                  <div>
                    <CheckCircle2 className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
                    <span>Tidak ada antrean yang sedang menunggu</span>
                  </div>
                </div>
              ) : (
                waitingList.slice(0, 6).map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3 sm:p-3.5 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-white/10 text-slate-300 font-bold text-xs grid place-items-center">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">
                          {item.layanan.kode}-{String(item.nomor).padStart(3, '0')}
                        </p>
                        <p className="text-[11px] text-slate-300 truncate max-w-[140px]">
                          {item.layanan.nama}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                      MENUNGGU
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Box QR Code: Ambil Antrean via Smartphone */}
            <div className="mt-4 pt-4 border-t border-white/10 bg-white/5 rounded-2xl p-4 flex items-center gap-3.5 border border-white/5">
              <div className="bg-white p-2 rounded-xl text-[#0A192F] shrink-0 shadow">
                <QrCode className="w-12 h-12" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-white leading-tight">
                  Ambil Tiket Online dari Ponsel
                </p>
                <p className="text-[10px] text-slate-300 leading-snug">
                  Pindai QR code ini untuk mendaftar antrean mandiri tanpa login di{' '}
                  <b className="text-[#D4AF37]">antri-capil.vercel.app</b>
                </p>
              </div>
            </div>
          </div>

          {/* Navigasi Cepat Pengawas / Petugas */}
          <div className="bg-[#0A192F]/60 border border-white/10 rounded-2xl p-4 flex items-center justify-between text-xs text-slate-300">
            <Link
              href="/"
              className="hover:text-white flex items-center gap-1 font-semibold transition"
            >
              <span>← Beranda</span>
            </Link>
            <Link
              href="/admin"
              className="text-[#D4AF37] hover:underline font-bold flex items-center gap-1 transition"
            >
              <span>Panel Petugas Loket</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* FOOTER BAR: Running Text / Marquee Berita Resmi Adminduk */}
      {/* ========================================================= */}
      <footer className="w-full bg-[#0F264A] border-t border-[#1E3A8A] py-2.5 px-4 overflow-hidden text-xs font-bold text-[#F5DEB3] shadow-lg">
        <div className="whitespace-nowrap overflow-hidden">
          <div className="inline-block animate-marquee uppercase tracking-wider">
            🏛️ SELAMAT DATANG DI DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL KABUPATEN SAMBAS •
            SELURUH PELAYANAN DOKUMEN KEPENDUDUKAN (KTP-EL, KK, KIA, AKTA) TIDAK DIPUNGUT BIAYA (GRATIS) •
            HINDARI CALO DAN PERANTARA • MOHON MEMBAWA DOKUMEN DAN PERSYARATAN ASLI SAAT NOMOR ANDA DIPANGGIL MENUJU LOKET •
            PANTAU STATUS TIKET DARI SMARTPHONE ANDA DI ANTRI-CAPIL.VERCEL.APP •
            TERIMA KASIH ATAS KETERTIBAN ANDA DI RUANG PELAYANAN KAMI.
          </div>
        </div>

        <style jsx>{`
          @keyframes marquee {
            0% {
              transform: translateX(100%);
            }
            100% {
              transform: translateX(-100%);
            }
          }
          .animate-marquee {
            display: inline-block;
            animation: marquee 35s linear infinite;
          }
        `}</style>
      </footer>
    </div>
  );
}
