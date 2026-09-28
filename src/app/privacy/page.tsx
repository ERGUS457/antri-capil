import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF0] text-zinc-800">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="text-teal-600 hover:underline text-sm font-bold">
          ← Kembali ke Beranda
        </Link>

        <header className="mt-6 mb-10 flex items-center gap-3">
          <img src="/logo-sambas.png" alt="Logo AntriCapil" className="w-10 h-10 rounded-full shadow-sm" />
          <h1 className="text-2xl font-black tracking-tight text-zinc-900">
            Kebijakan Privasi — AntriCapil Sambas
          </h1>
        </header>

        <section className="bg-white rounded-[24px] border border-orange-100 p-8 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900">Data yang Dikumpulkan</h2>
          <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
            Kami mengumpulkan data yang Anda berikan secara langsung saat mendaftar atau melakukan booking,
            termasuk:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-zinc-600">
            <li>Nama lengkap</li>
            <li>Alamat email</li>
            <li>NIK (opsional)</li>
            <li>Data antrean dan pilihan layanan</li>
          </ul>

          <h2 className="mt-8 text-lg font-bold text-zinc-900">Tujuan Penggunaan</h2>
          <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
            Data tersebut digunakan untuk:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-zinc-600">
            <li>Menyediakan layanan antrean Disdukcapil Kab. Sambas</li>
            <li>Verifikasi identitas di loket</li>
            <li>Pengiriman notifikasi tiket via email</li>
          </ul>

          <h2 className="mt-8 text-lg font-bold text-zinc-900">Penyimpanan Data</h2>
          <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
            Data tersimpan di server cloud (Neon PostgreSQL) dengan enkripsi. Akses hanya diberikan kepada
            petugas Disdukcapil Sambas yang bertugas melayani antrean.
          </p>

          <h2 className="mt-8 text-lg font-bold text-zinc-900">Hak Anda</h2>
          <ul className="mt-4 space-y-2 text-sm text-zinc-600">
            <li>Mengakses data pribadi Anda</li>
            <li>Meminta penghapusan akun dengan menghubungi petugas loket</li>
            <li>Menarik persetujuan penggunaan data</li>
          </ul>

          <h2 className="mt-8 text-lg font-bold text-zinc-900">Kontak</h2>
          <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
            Hubungi petugas loket Disdukcapil Kabupaten Sambas untuk pertanyaan terkait data pribadi.
          </p>

          <h2 className="mt-8 text-lg font-bold text-zinc-900">Perubahan Kebijakan</h2>
          <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
            Kebijakan ini dapat diperbarui sewaktu-waktu. Perubahan akan ditayangkan di halaman ini.
          </p>
        </section>

        <p className="mt-8 text-center text-xs text-zinc-400">
          © {new Date().getFullYear()} AntriCapil • Disdukcapil Kab. Sambas
        </p>
      </div>
    </div>
  );
}
