import Link from "next/link";

const layanan = [
  { kode: "KTP", nama: "KTP", desc: "Pembuatan & perpanjangan", icon: "🪪", color: "text-sky-600" },
  { kode: "KK", nama: "KK", desc: "Kartu Keluarga", icon: "👨‍👩‍👧", color: "text-emerald-600" },
  { kode: "KIA", nama: "KIA", desc: "Identitas Anak", icon: "🧒", color: "text-amber-600" },
  { kode: "PINDAH", nama: "Pindah", desc: "Pindah Datang", icon: "🏠", color: "text-violet-600" },
  { kode: "AKTA", nama: "Akta", desc: "Lahir, Mati, Nikah", icon: "📜", color: "text-rose-600" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFFBF0] text-zinc-900 pb-20">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-orange-100">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-black text-xl">
            <span className="w-10 h-10 rounded-2xl bg-teal-600 text-white grid place-items-center">◈</span>
            AntriCapil
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-5 py-2.5 rounded-full font-bold text-sm text-zinc-600 hover:bg-zinc-100">Masuk</Link>
            <Link href="/register" className="bg-teal-600 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-teal-700 shadow-lg shadow-teal-600/20">Daftar</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 pt-16 pb-10 text-center">
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.95]">
          Urus dokumen <span className="text-teal-600">tanpa antre</span>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 max-w-lg mx-auto">Sistem antrean online Disdukcapil Kabupaten Sambas. Daftar sekali, booking kapan saja, datang langsung dilayani.</p>
        <div className="mt-10 flex flex-center justify-center gap-4">
          <Link href="/register" className="bg-teal-600 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-teal-700 shadow-xl shadow-teal-600/20">Daftar Akun Warga</Link>
        </div>
      </section>

      {/* CARA PENGGUNAAN */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-black text-center mb-12">Cara Pakai, Mudah Sekali</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { n: "01", t: "Daftar Akun", d: "Buat akun warga pakai email & NIK.", i: "👤" },
            { n: "02", t: "Pilih Jadwal", d: "Pilih jenis layanan & tanggal kunjungan.", i: "📅" },
            { n: "03", t: "Tunjuk QR", d: "Datang ke loket, tunjuk QR di HP.", i: "📲" },
          ].map(step => (
            <div key={step.n} className="bg-white p-8 rounded-[24px] border border-orange-100 text-center">
              <div className="text-4xl mb-4">{step.i}</div>
              <p className="text-teal-600 font-black tracking-widest text-xs uppercase">{step.n}</p>
              <h3 className="font-black text-xl mt-2">{step.t}</h3>
              <p className="text-zinc-600 text-sm mt-3">{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LAYANAN */}
      <section id="layanan" className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white rounded-[32px] p-8 border border-orange-100">
          <h2 className="text-2xl font-black mb-8 text-center">Layanan Kependudukan</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {layanan.map(l => (
              <div key={l.kode} className="bg-orange-50 rounded-2xl p-5 text-center">
                <div className={`text-3xl mb-3 ${l.color}`}>{l.icon}</div>
                <h3 className="font-black text-sm">{l.nama}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 pt-10 text-center">
        <Link href="/register" className="text-teal-700 font-bold hover:underline">Sudah punya akun? Masuk Sekarang →</Link>
        <p className="text-zinc-400 text-xs mt-10">© {new Date().getFullYear()} Disdukcapil Sambas</p>
      </div>
    </div>
  );
}
