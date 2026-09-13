import Link from "next/link";

const layanan = [
  { kode: "KTP", nama: "KTP Elektronik", desc: "Pembuatan & perpanjangan KTP-el, perekaman biometrik", icon: "🪪", color: "from-blue-500 to-indigo-600" },
  { kode: "KK", nama: "Kartu Keluarga", desc: "Pembuatan, perubahan & cetak ulang KK", icon: "👨‍👩‍👧", color: "from-emerald-500 to-teal-600" },
  { kode: "KIA", nama: "KIA", desc: "Kartu Identitas Anak usia 0–17 tahun", icon: "🧒", color: "from-amber-500 to-orange-600" },
  { kode: "PINDAH", nama: "Pindah Datang", desc: "SKPWNI, mutasi & pindah antar daerah", icon: "📦", color: "from-purple-500 to-pink-600" },
  { kode: "AKTA", nama: "Akta Capil", desc: "Akta kelahiran, kematian & perkawinan", icon: "📜", color: "from-rose-500 to-red-600" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* NAV */}
      <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-zinc-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <span className="w-8 h-8 rounded-lg bg-blue-600 text-white grid place-items-center">◈</span>
            AntriCapil
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-zinc-600">
            <Link href="/booking" className="hover:text-zinc-900 font-medium">Booking</Link>
            <Link href="/display" className="hover:text-zinc-900 font-medium">Display TV</Link>
            <Link href="/admin-capil-loket" className="text-zinc-400 hover:text-zinc-600 text-xs">Akses Petugas</Link>
          </div>
          <Link href="/booking" className="bg-zinc-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-black">Ambil Antrean</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase bg-blue-50 text-blue-700 px-3 py-1 rounded-full mb-4">Disdukcapil • Antrean Online</div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.05]">
            Urus Dokumen<br />Kependudukan <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Tanpa Antre Lama</span>
          </h1>
          <p className="mt-4 text-zinc-600 leading-relaxed max-w-xl">Booking antrean online untuk KTP, KK, KIA, Pindah & Akta. Dapatkan nomor antrean, tiket digital + QR, dan notifikasi email — datang sesuai jadwal.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/booking" className="bg-blue-600 text-white px-7 py-3.5 rounded-full font-semibold hover:bg-blue-700">Booking Sekarang →</Link>
            <Link href="/display" className="bg-zinc-100 px-7 py-3.5 rounded-full font-semibold hover:bg-zinc-200">Lihat Display TV</Link>
          </div>
          <div className="mt-6 flex items-center gap-6 text-sm text-zinc-500">
            <span>✔ Kuota harian 80/or layanan</span><span>✔ QR Tiket</span><span>✔ Email otomatis</span>
          </div>
        </div>
        <div className="relative">
          <div className="rounded-[28px] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-8 text-white shadow-2xl">
            <p className="text-white/80 text-sm uppercase tracking-widest font-semibold">Contoh Tiket Digital</p>
            <div className="mt-6 bg-white text-zinc-900 rounded-2xl p-6">
              <div className="flex justify-between items-start">
                <div><p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Nomor Antrean</p><p className="text-5xl font-black text-blue-600">A-012</p></div>
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">MENUNGGU</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-zinc-500">Layanan</p><p className="font-semibold">KTP Elektronik</p></div>
                <div><p className="text-zinc-500">Tanggal</p><p className="font-semibold">2025-09-14</p></div>
              </div>
              <div className="mt-4 border-2 border-dashed border-zinc-200 rounded-xl h-20 grid place-items-center text-zinc-400 text-xs">QR Code</div>
            </div>
            <p className="mt-4 text-white/70 text-xs text-center">Tunjukkan QR saat datang ke loket</p>
          </div>
        </div>
      </section>

      {/* FITUR */}
      <section className="bg-zinc-50 border-y border-zinc-100">
        <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-6">
          {[
            { t: "Booking 30 Detik", d: "Isi NIK, pilih layanan & tanggal — langsung dapat nomor antrean.", i: "⚡" },
            { t: "Kuota Terjamin", d: "Sistem cek kuota harian real-time, tidak overbook.", i: "🛡️" },
            { t: "Tiket Digital + Email", d: "QR & link tiket dikirim ke email, bisa dicetak.", i: "🎫" },
          ].map(f => (
            <div key={f.t} className="bg-white rounded-2xl p-6 border border-zinc-100">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white grid place-items-center">{f.i}</div>
              <h3 className="mt-4 font-bold">{f.t}</h3><p className="mt-1 text-sm text-zinc-600 leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LAYANAN */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-bold">Layanan Tersedia</h2>
        <p className="text-zinc-600 mt-1">Pilih layanan sesuai kebutuhan Anda.</p>
        <div className="mt-8 grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          {layanan.map(l => (
            <div key={l.kode} className="rounded-2xl border border-zinc-200 p-5 hover:shadow-lg transition">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${l.color} text-white grid place-items-center text-xl`}>{l.icon}</div>
              <p className="mt-3 text-xs font-bold tracking-widest text-zinc-500">{l.kode}</p>
              <h3 className="font-bold leading-tight">{l.nama}</h3>
              <p className="mt-1 text-xs text-zinc-600 leading-relaxed">{l.desc}</p>
              <Link href="/booking" className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline">Booking →</Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="rounded-[24px] bg-zinc-900 text-white p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div><h3 className="text-2xl font-bold">Siap booking antrean?</h3><p className="text-white/70 mt-1">Datang tepat waktu, tanpa antre berjam-jam.</p></div>
          <Link href="/booking" className="bg-white text-zinc-900 px-8 py-3.5 rounded-full font-bold hover:bg-zinc-100">Booking Antrean Sekarang</Link>
        </div>
        <p className="text-center text-xs text-zinc-400 mt-6">© {new Date().getFullYear()} Disdukcapil AntriCapil • Jam layanan Senin–Jumat 08.00–15.00</p>
      </section>
    </div>
  );
}
