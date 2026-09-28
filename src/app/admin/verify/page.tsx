'use client';

import { Html5Qrcode } from 'html5-qrcode';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Antrean = {
  id: string;
  nomor: number;
  tanggal: string;
  status: string;
  warga: { nama: string; nik: string } | null;
  user: { name: string | null; nik: string | null } | null;
  layanan: { nama: string; kode: string };
};

const statusClass: Record<string, string> = {
  MENUNGGU: 'bg-amber-100 text-amber-700',
  DIPANGGIL: 'bg-teal-100 text-teal-700',
  SELESAI: 'bg-emerald-100 text-emerald-700',
};

function tokenFromScan(value: string) {
  try {
    const url = new URL(value);
    const parts = url.pathname.split('/').filter(Boolean);
    const verificationIndex = parts.findIndex((part) => part.toLowerCase() === 'verifikasi');
    if (verificationIndex >= 0 && parts[verificationIndex + 1]) {
      return decodeURIComponent(parts[verificationIndex + 1]);
    }
    return url.searchParams.get('token') || value.trim();
  } catch {
    return value.trim();
  }
}

function maskNik(nik: string | null | undefined) {
  if (!nik) return '-';
  const clean = nik.trim();
  return clean.length <= 4 ? clean : `${'•'.repeat(clean.length - 4)}${clean.slice(-4)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(value));
}

export default function VerifyPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [token, setToken] = useState('');
  const [ticket, setTicket] = useState<Antrean | null>(null);
  const [error, setError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const stopCamera = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    setScanning(false);
    if (scanner) {
      try {
        await scanner.stop();
      } catch {
        // The scanner may already be stopped when a result is delivered.
      }
      scanner.clear();
    }
  }, []);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') router.replace('/login');
  }, [router, sessionStatus]);

  useEffect(() => () => {
    void stopCamera();
  }, [stopCamera]);

  const verify = useCallback(async (rawToken: string) => {
    const nextToken = tokenFromScan(rawToken);
    if (!nextToken) {
      setError('Kode tiket wajib diisi.');
      return;
    }
    setLoading(true);
    setError('');
    setCameraError('');
    try {
      const response = await fetch(`/api/verify?token=${encodeURIComponent(nextToken)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Tiket tidak dapat diverifikasi.');
      setToken(nextToken);
      setTicket(data as Antrean);
      await stopCamera();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tiket tidak dapat diverifikasi.');
    } finally {
      setLoading(false);
    }
  }, [stopCamera]);

  async function startCamera() {
    setError('');
    setCameraError('');
    if (scanning) return;
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;
    setScanning(true);
    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => void verify(decodedText),
        () => undefined,
      );
    } catch {
      scannerRef.current = null;
      setScanning(false);
      try { await scanner.stop(); } catch { /* camera never started */ }
      setCameraError('Kamera tidak dapat diakses. Izinkan akses kamera atau gunakan input manual.');
    }
  }

  async function updateStatus(action: 'PANGGIL' | 'SELESAI' | 'LEWATI' | 'BATAL') {
    if (!ticket) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/antrean', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ticket.id, action }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal memperbarui status tiket.');
      const refreshed = await fetch(`/api/verify?token=${encodeURIComponent(token)}`);
      const refreshedData = await refreshed.json();
      if (!refreshed.ok) throw new Error(refreshedData.error || 'Gagal memuat status terbaru.');
      setTicket(refreshedData as Antrean);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui status tiket.');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    void stopCamera();
    setTicket(null);
    setToken('');
    setError('');
    setCameraError('');
  }

  if (sessionStatus === 'loading') {
    return <main className="min-h-screen bg-[#FFFBF0] grid place-items-center text-zinc-500">Memuat sesi...</main>;
  }

  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session) return null;
  if (role !== 'ADMIN') {
    return (
      <main className="min-h-screen bg-[#FFFBF0] grid place-items-center p-6 text-zinc-900">
        <section className="bg-white rounded-[24px] border border-orange-100 p-8 shadow-sm text-center max-w-md w-full">
          <h1 className="text-2xl font-black tracking-tight">Akses Ditolak</h1>
          <p className="mt-2 text-sm text-zinc-500">Halaman ini hanya dapat digunakan oleh petugas ADMIN.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFBF0] text-zinc-900 p-4 sm:p-8">
      <div className="max-w-xl mx-auto">
        <header className="mb-6">
          <p className="text-sm font-bold tracking-widest text-teal-600 uppercase">Loket Pelayanan</p>
          <h1 className="text-2xl font-black tracking-tight mt-1">Verifikasi Tiket</h1>
          <p className="text-sm text-zinc-500 mt-1">Pindai QR atau masukkan kode tiket warga.</p>
        </header>

        {error && <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>}

        {!ticket ? (
          <section className="bg-white rounded-[24px] border border-orange-100 p-5 sm:p-8 shadow-sm">
            <button type="button" onClick={startCamera} disabled={scanning || loading} className="w-full bg-teal-600 text-white rounded-full py-3.5 font-bold hover:bg-teal-700 shadow-md shadow-teal-600/20 disabled:opacity-50">
              {scanning ? 'Kamera Aktif — Arahkan ke QR' : 'Buka Kamera untuk Pindai QR'}
            </button>
            <div id="qr-reader" className="mx-auto mt-5 max-w-sm overflow-hidden rounded-2xl" />
            {scanning && <button type="button" onClick={() => void stopCamera()} className="w-full mt-3 text-sm font-bold text-zinc-500 hover:text-zinc-800">Tutup Kamera</button>}
            {cameraError && <p className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{cameraError}</p>}
            <div className="flex items-center gap-3 my-6 text-xs font-bold text-zinc-400"><span className="h-px bg-orange-100 flex-1" /> ATAU <span className="h-px bg-orange-100 flex-1" /></div>
            <form onSubmit={(event) => { event.preventDefault(); void verify(token); }} className="space-y-3">
              <label htmlFor="token" className="text-sm font-bold text-zinc-700">Kode tiket manual</label>
              <input id="token" value={token} onChange={(event) => setToken(event.target.value)} placeholder="Tempel kode tiket di sini" className="w-full bg-[#FFFBF0] border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
              <button type="submit" disabled={loading || !token.trim()} className="w-full bg-teal-600 text-white rounded-full py-3.5 font-bold hover:bg-teal-700 shadow-md shadow-teal-600/20 disabled:opacity-50">{loading ? 'Memeriksa...' : 'Verifikasi Tiket'}</button>
            </form>
          </section>
        ) : (
          <section className="bg-white rounded-[24px] border border-orange-100 p-6 sm:p-8 shadow-sm">
            <div className="flex items-start justify-between gap-4 border-b border-orange-100 pb-6">
              <div><p className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Nomor antrean</p><p className="text-6xl font-black tracking-tight text-teal-600 mt-1">{String(ticket.nomor).padStart(3, '0')}</p></div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-black ${statusClass[ticket.status] || 'bg-zinc-100 text-zinc-600'}`}>{ticket.status}</span>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-5 py-6 text-sm">
              <div><dt className="text-zinc-400">Layanan</dt><dd className="font-bold mt-1">{ticket.layanan.nama}</dd><dd className="text-xs text-teal-700 font-bold">{ticket.layanan.kode}</dd></div>
              <div><dt className="text-zinc-400">Tanggal</dt><dd className="font-bold mt-1">{formatDate(ticket.tanggal)}</dd></div>
              <div><dt className="text-zinc-400">Nama warga</dt><dd className="font-bold mt-1">{ticket.user?.name || ticket.warga?.nama || '-'}</dd></div>
              <div><dt className="text-zinc-400">NIK</dt><dd className="font-mono font-bold mt-1">{maskNik(ticket.user?.nik || ticket.warga?.nik)}</dd></div>
            </dl>
            <div className="grid grid-cols-2 gap-3">
              {ticket.status === 'MENUNGGU' && <button disabled={loading} onClick={() => void updateStatus('PANGGIL')} className="col-span-2 bg-teal-600 text-white rounded-full py-3 font-bold hover:bg-teal-700 disabled:opacity-50">DIPANGGIL</button>}
              {ticket.status === 'DIPANGGIL' && <button disabled={loading} onClick={() => void updateStatus('SELESAI')} className="col-span-2 bg-emerald-600 text-white rounded-full py-3 font-bold hover:bg-emerald-700 disabled:opacity-50">SELESAI</button>}
              {(ticket.status === 'MENUNGGU' || ticket.status === 'DIPANGGIL') && <button disabled={loading} onClick={() => void updateStatus('LEWATI')} className="bg-amber-50 text-amber-700 border border-amber-200 rounded-full py-3 font-bold hover:bg-amber-100 disabled:opacity-50">LEWATI</button>}
              {(ticket.status === 'MENUNGGU' || ticket.status === 'DIPANGGIL') && <button disabled={loading} onClick={() => void updateStatus('BATAL')} className="bg-red-50 text-red-600 border border-red-200 rounded-full py-3 font-bold hover:bg-red-100 disabled:opacity-50">BATAL</button>}
            </div>
            <button type="button" onClick={reset} className="w-full mt-5 border border-zinc-200 text-zinc-600 rounded-full py-3 font-bold hover:bg-zinc-50">Scan Lagi</button>
          </section>
        )}
      </div>
    </main>
  );
}
