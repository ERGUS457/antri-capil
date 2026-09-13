'use client';
import { useEffect, useState } from 'react';

type Antrean = { id: string; nomor: number; status: string; layanan: { kode: string; nama: string } };

export default function DisplayPage() {
  const [active, setActive] = useState<Antrean[]>([]);
  const [waiting, setWaiting] = useState<Antrean[]>([]);
  const tgl = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [r1, r2] = await Promise.all([
          fetch(`/api/antrean?tanggal=${tgl}&status=DIPANGGIL`),
          fetch(`/api/antrean?tanggal=${tgl}&status=MENUNGGU`)
        ]);
        const d1 = await r1.json();
        const d2 = await r2.json();
        setActive(d1.antrean || []);
        setWaiting(d2.antrean?.slice(0, 5) || []);
      } catch (e) { console.error(e); }
    };
    fetchAll();
    const iv = setInterval(fetchAll, 5000);
    return () => clearInterval(iv);
  }, [tgl]);

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-10 flex flex-col gap-10">
      <div className="flex justify-between items-center border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl grid place-items-center text-3xl">◈</div>
          <div><h1 className="text-4xl font-black uppercase tracking-tighter">Antrean Online</h1><p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">Disdukcapil Kabupaten/Kota</p></div>
        </div>
        <div className="text-right">
          <p className="text-5xl font-mono font-bold">{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 flex-1">
        <div className="lg:col-span-2 grid md:grid-cols-2 gap-6 content-start">
          {active.length === 0 ? (
            <div className="md:col-span-2 h-64 bg-white/5 rounded-[32px] border border-white/10 grid place-items-center text-zinc-600 text-2xl font-bold uppercase">Menunggu Panggilan</div>
          ) : active.map(a => (
            <div key={a.id} className="bg-blue-600 rounded-[32px] p-8 shadow-[0_20px_50px_rgba(37,99,235,0.3)] animate-pulse">
              <p className="text-white/70 uppercase tracking-widest font-black text-sm">{a.layanan.nama}</p>
              <h2 className="text-[120px] font-black leading-none mt-2 tracking-tighter">{a.layanan.kode}-{String(a.nomor).padStart(3, '0')}</h2>
              <div className="mt-6 flex items-center gap-3"><span className="w-3 h-3 bg-white rounded-full animate-ping"></span><p className="text-xl font-bold uppercase">Silakan ke Loket</p></div>
            </div>
          ))}
        </div>

        <div className="bg-white/5 rounded-[40px] border border-white/10 p-8 flex flex-col">
          <h3 className="text-zinc-500 font-black uppercase tracking-widest text-sm mb-6 border-b border-white/10 pb-4">Antrean Berikutnya</h3>
          <div className="flex flex-col gap-4">
            {waiting.length === 0 ? <p className="text-zinc-700 italic">Belum ada antrean masuk</p> : waiting.map(w => (
              <div key={w.id} className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5">
                <div><p className="text-blue-400 font-bold text-xs uppercase tracking-widest">{w.layanan.kode}</p><p className="text-2xl font-black">{String(w.nomor).padStart(3, '0')}</p></div>
                <span className="text-zinc-600 font-bold text-xs uppercase bg-white/5 px-3 py-1 rounded-full">Menunggu</span>
              </div>
            ))}
          </div>
          <div className="mt-auto pt-10">
            <div className="bg-blue-600/10 border border-blue-600/20 rounded-3xl p-6 text-center">
              <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">Pendaftaran Online</p>
              <p className="text-lg font-bold">antricapil.go.id</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white/5 p-4 rounded-2xl text-center text-zinc-600 text-sm font-bold uppercase tracking-[0.2em] overflow-hidden whitespace-nowrap">
        <div className="inline-block animate-marquee">Informasi: Pastikan membawa dokumen asli saat datang ke loket. • Layanan hari ini buka hingga pukul 15.00 WIB. • Mohon menjaga ketertiban di area pelayanan.</div>
      </div>
      <style jsx>{`
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .animate-marquee { display: inline-block; animation: marquee 30s linear infinite; }
      `}</style>
    </div>
  );
}
