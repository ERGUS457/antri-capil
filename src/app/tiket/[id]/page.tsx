'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';

type Tiket = {
  id: string; nomor: number; tanggal: string; status: string;
  warga: { nik: string; nama: string; email?: string | null };
  layanan: { kode: string; nama: string };
};

export default function TiketPage() {
  const { id } = useParams() as { id: string };
  const [tiket, setTiket] = useState<Tiket | null>(null);
  const [qr, setQr] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/antrean?id=${id}`)
      .then(r => r.json())
      .then(async (d) => {
        if (d.error) { setError(d.error); return; }
        setTiket(d);
        const url = `${window.location.origin}/tiket/${d.id}`;
        setQr(await QRCode.toDataURL(url, { width: 220, margin: 1 }));
      })
      .catch(e => setError(String(e.message)));
  }, [id]);

  if (error) return <div className="min-h-screen grid place-items-center"><div className="text-center"><p className="text-red-600 font-semibold">{error}</p><Link href="/booking" className="text-blue-600 text-sm">← Booking ulang</Link></div></div>;
  if (!tiket) return <div className="min-h-screen grid place-items-center text-zinc-500">Memuat tiket...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-6 print:bg-white">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6 print:hidden">
          <p className="inline-block bg-green-100 text-green-700 text-sm font-bold px-4 py-1.5 rounded-full">✔ Booking Berhasil</p>
        </div>
        <div className="bg-white rounded-[24px] border border-zinc-200 overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 text-center">
            <p className="text-xs uppercase tracking-widest opacity-80 font-semibold">Nomor Antrean • {tiket.layanan.kode}</p>
            <p className="text-6xl font-black mt-1">{String(tiket.nomor).padStart(3, '0')}</p>
            <p className="text-sm mt-1 opacity-90">{tiket.layanan.nama}</p>
          </div>
          <div className="p-6">
            {qr && <img src={qr} alt="QR Tiket" className="mx-auto w-44 h-44 border border-zinc-100 rounded-xl" />}
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-zinc-500">Nama</p><p className="font-semibold">{tiket.warga.nama}</p></div>
              <div><p className="text-zinc-500">NIK</p><p className="font-semibold">{tiket.warga.nik}</p></div>
              <div><p className="text-zinc-500">Tanggal</p><p className="font-semibold">{new Date(tiket.tanggal).toISOString().slice(0, 10)}</p></div>
              <div><p className="text-zinc-500">Status</p><span className="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">{tiket.status}</span></div>
            </div>
            <p className="mt-4 text-xs text-zinc-500 leading-relaxed">Tunjukkan QR ini di loket. Datang 15 menit sebelum jadwal. Tiket juga dikirim ke email {tiket.warga.email || '—'}.</p>
          </div>
        </div>
        <div className="mt-4 flex gap-3 print:hidden">
          <button onClick={() => window.print()} className="flex-1 bg-zinc-900 text-white rounded-full py-3 font-semibold hover:bg-black">🖨 Cetak Tiket</button>
          <Link href="/" className="flex-1 text-center bg-white border border-zinc-200 rounded-full py-3 font-semibold hover:bg-zinc-50">Beranda</Link>
        </div>
      </div>
    </div>
  );
}
