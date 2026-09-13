import Link from "next/link";

const layanan = [
  { kode: "KTP", nama: "KTP Elektronik", desc: "Buat & perpanjang KTP-el, rekam biometrik", icon: "🪪", bg: "bg-sky-100", accent: "text-sky-600" },
  { kode: "KK", nama: "Kartu Keluarga", desc: "Buat, ubah & cetak ulang KK", icon: "👨‍👩‍👧", bg: "bg-emerald-100", accent: "text-emerald-600" },
  { kode: "KIA", nama: "KIA Anak", desc: "Kartu Identitas Anak 0–17 tahun", icon: "🧒", bg: "bg-amber-100", accent: "text-amber-600" },
  { kode: "PINDAH", nama: "Pindah Datang", desc: "SKPWNI & mutasi antar daerah", icon: "🏠", bg: "bg-violet-100", accent: "text-violet-600" },
  { kode: "AKTA", nama: "Akta Capil", desc: "Akta lahir, mati & nikah", icon: "📜", bg: "bg-rose-100", accent: "text-rose-600" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFFBF0] text-zinc-800">
      {/* NAV — ramah, bersih, tanpa jejak admin */}
      <nav className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-orange-100">
        <div className="max-w-6xl mx-auto px-6 h-[68px] flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5 font-extrabold text-[17px] tracking-tight">
            <img src="/logo-sambas.png" alt="Lambang Kabupaten Sambas" className="w-9 h-9 rounded-xl object-contain border border-orange-100 shadow-sm bg-white" />
            <span className="text-zinc-900">Antri<span className="text-teal-600">Capil</span></span>
            <span className="hidden sm:inline text-[10px] font-bold tracking-widest bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full ml-1">SAMBAS</span>
          </Link>

          <div className="hidden md:flex items-center gap-1 text-sm">
            <Link href="#layanan" className="px-3 py-2 rounded-full hover:bg-zinc-50 font-medium text-zinc-600">Layanan</Link>
            <Link href="/display" className="px-3 py-2 rounded-full hover:bg-zinc-50 font-medium text-zinc-600">Papan Antrean</Link>
            <Link href="/dashboard" className="px-3 py-2 rounded-full hover:bg-zinc-50 font-medium text-zinc-600">Riwayat Saya</Link>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/login" className="hidden sm:inline-flex px-5 py-2.5 rounded-full text-sm font-semibold text-zinc-700 hover:bg-zinc-100 border border-zinc-200">Masuk</Link>
            <Link href="/register" className="inline-flex bg-teal-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-teal-700 shadow-md shadow-teal-600/20 transition">Daftar</Link>
          </div>
        </div>
      </nav>

      {/* HERO — warm, friendly, untuk semua usia */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-8 md:pt-16 md:pb-14 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-white border border-orange-200 text-orange-700 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Disdukcapil Kab. Sambas • Buka Sen–Jum 08.00–15.00
          </div>
          <h1 className="mt-5 text-[34px] md:text-[46px] font-black tracking-tight leading-[0.95] text-zinc-900">
            Urus dokumen<br />
            <span className="text-teal-600">tanpa antre</span> <span className="inline-block bg-amber-400 text-zinc-900 px-2.5 py-0.5 rounded-xl rotate-[-1deg] text-[0.85em]">lama</span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-zinc-600 max-w-xl">
            Daftar akun dulu, lalu booking jadwal KTP, KK, KIA, Pindah & Akta. Dapat nomor antrean + tiket QR, cek progres kapan saja di HP — datang sesuai jam, pulang cepat.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/register" className="bg-teal-600 text-white px-7 py-3.5 rounded-full font-bold hover:bg-teal-700 shadow-lg shadow-teal-600/20">Daftar Akun Warga →</Link>
            <Link href="/login" className="bg-white border border-zinc-200 px-7 py-3.5 rounded-full font-bold hover:bg-zinc-50">Sudah punya akun? Masuk</Link>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="bg-white border border-zinc-200 px-3 py-1.5 rounded-full">✔ Daftar 1 menit</span>
            <span className="bg-white border border-zinc-200 px-3 py-1.5 rounded-full">✔ Kuota harian 80</span>
            <span className="bg-white border border-zinc-200 px-3 py-1.5 rounded-full">✔ Tiket dikirim ke email</span>
          </div>


        </div>

        {/* kartu tiket — friendly */}
        <div className="relative">
          <div className="rounded-[28px] bg-gradient-to-br from-teal-600 via-teal-500 to-amber-400 p-[1.5px] shadow-xl">
            <div className="rounded-[26px] bg-white p-6 md:p-7">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black tracking-widest text-zinc-400 uppercase">Tiket Digital Kamu</p>
                <span className="bg-amber-100 text-amber-700 text-[11px] font-black px-3 py-1 rounded-full">MENUNGGU</span>
              </div>
              <div className="mt-4 flex gap-4 items-start">
                <div className="flex-1">
                  <p className="text-xs font-bold tracking-widest text-teal-600">KTP • 14 SEP 2025 • 09:00</p>
                  <p className="text-[44px] font-black leading-none tracking-tighter text-zinc-900 mt-1">A-012</p>
                  <p className="text-sm text-zinc-600 mt-1">Atas nama <b className="text-zinc-900">Budi Santoso</b></p>
                  <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">● Progres bisa dipantau di Riwayat Saya</div>
                </div>
                <div className="w-[92px] h-[92px] rounded-2xl border-2 border-dashed border-zinc-200 grid place-items-center bg-zinc-50 text-zinc-400 text-[10px] font-bold leading-tight text-center p-2">QR CODE<br />tunjuk di loket</div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { k: "Daftar", v: "di HP" },
                  { k: "Booking", v: "pilih jam" },
                  { k: "Datang", v: "tunjuk QR" },
                ].map(s => (
                  <div key={s.k} className="bg-[#FFFBF0] border border-orange-100 rounded-2xl py-2.5">
                    <p className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">{s.k}</p>
                    <p className="text-sm font-bold text-zinc-900">{s.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-zinc-500 mt-3">Contoh tampilan — setelah booking, tiket persis seperti ini masuk email & Riwayat Saya</p>
        </div>
      </section>

      {/* ALUR — super jelas untuk ibu/bapak */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="bg-white rounded-[24px] border border-zinc-200 p-6 md:p-7 flex flex-col md:flex-row gap-4 md:items-center justify-between">
          {[
            { n: "1", t: "Daftar / Masuk", d: "Pakai email & NIK, 1 menit jadi" },
            { n: "2", t: "Booking jadwal", d: "Pilih layanan & tanggal" },
            { n: "3", t: "Dapat nomor + QR", d: "Tiket masuk email & Riwayat" },
            { n: "4", t: "Pantau progres", d: "Status update realtime" },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-3 flex-1">
              <span className="w-9 h-9 shrink-0 rounded-full bg-teal-600 text-white grid place-items-center font-black text-sm">{s.n}</span>
              <div>
                <p className="font-bold text-sm leading-none">{s.t}</p>
                <p className="text-xs text-zinc-500 mt-1">{s.d}</p>
              </div>
              {i < 3 && <span className="hidden md:block ml-auto text-zinc-300">→</span>}
            </div>
          ))}
        </div>
      </section>

      {/* FITUR */}
      <section className="max-w-6xl mx-auto px-6 py-8 grid md:grid-cols-3 gap-4">
        {[
          { t: "Ramah untuk semua", d: "Tombol besar, tulisan jelas, bisa dipakai orang tua & anak muda.", i: "🤗" },
          { t: "Kuota terjamin", d: "Sistem cek kuota harian — tidak overbook, tidak kecewa di loket.", i: "✅" },
          { t: "Pantau dari HP", d: "Status MENUNGGU → DIPANGGIL → SELESAI realtime di Riwayat Saya.", i: "📱" },
        ].map(f => (
          <div key={f.t} className="bg-white rounded-2xl p-5 border border-zinc-200">
            <div className="w-10 h-10 rounded-xl bg-[#FFFBF0] border border-orange-100 grid place-items-center text-lg">{f.i}</div>
            <h3 className="mt-3 font-bold">{f.t}</h3>
            <p className="mt-1 text-sm text-zinc-600 leading-relaxed">{f.d}</p>
          </div>
        ))}
      </section>

      {/* LAYANAN */}
      <section id="layanan" className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-black tracking-tight">Layanan tersedia</h2>
            <p className="text-sm text-zinc-600 mt-1">Pilih sesuai kebutuhan — booking setelah daftar akun.</p>
          </div>
          <Link href="/register" className="hidden md:inline-flex text-sm font-bold text-teal-600 hover:underline">Daftar dulu untuk booking →</Link>
        </div>
        <div className="mt-6 grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          {layanan.map(l => (
            <div key={l.kode} className="rounded-2xl border border-zinc-200 bg-white p-5 hover:shadow-md transition">
              <div className={`w-11 h-11 rounded-xl ${l.bg} grid place-items-center text-xl`}>{l.icon}</div>
              <p className={`mt-3 text-[11px] font-black tracking-widest ${l.accent}`}>{l.kode}</p>
              <h3 className="font-bold leading-tight">{l.nama}</h3>
              <p className="mt-1 text-xs text-zinc-600 leading-relaxed">{l.desc}</p>
              <Link href="/register" className="mt-3 inline-block text-sm font-bold text-teal-600 hover:underline">Daftar untuk booking →</Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-10">
        <div className="rounded-[24px] bg-zinc-900 text-white p-7 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-black">Siap urus dokumen tanpa antre lama?</h3>
            <p className="text-white/70 text-sm mt-1">Daftar akun warga dulu — gratis, 1 menit jadi.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/register" className="bg-white text-zinc-900 px-7 py-3 rounded-full font-bold hover:bg-zinc-100">Daftar Sekarang</Link>
            <Link href="/login" className="bg-white/10 border border-white/20 text-white px-7 py-3 rounded-full font-bold hover:bg-white/15">Masuk</Link>
          </div>
        </div>
        <p className="text-center text-xs text-zinc-400 mt-5">© {new Date().getFullYear()} AntriCapil • Disdukcapil Kab. Sambas • Bantuan: datang langsung ke loket informasi</p>
      </section>
    </div>
  );
}
