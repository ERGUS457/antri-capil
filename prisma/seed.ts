import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const layananData = [
  { kode: "KTP" as const, nama: "KTP Elektronik", deskripsi: "Pembuatan & perpanjangan KTP-el, perekaman biometrik", kuotaPerJam: 12 },
  { kode: "KK" as const, nama: "Kartu Keluarga", deskripsi: "Pembuatan, perubahan & cetak ulang Kartu Keluarga", kuotaPerJam: 15 },
  { kode: "KIA" as const, nama: "KIA (Kartu Identitas Anak)", deskripsi: "Penerbitan KIA untuk anak 0–17 tahun", kuotaPerJam: 10 },
  { kode: "PINDAH" as const, nama: "Pindah Datang", deskripsi: "Layanan pindah datang, SKPWNI & mutasi penduduk", kuotaPerJam: 8 },
  { kode: "AKTA" as const, nama: "Akta Pencatatan Sipil", deskripsi: "Akta kelahiran, kematian & perkawinan", kuotaPerJam: 10 },
];

async function main() {
  console.log("Seeding Layanan...");
  for (const l of layananData) {
    await prisma.layanan.upsert({
      where: { kode: l.kode },
      update: { nama: l.nama, deskripsi: l.deskripsi, kuotaPerJam: l.kuotaPerJam },
      create: l,
    });
    console.log(`  ✓ ${l.kode} - ${l.nama}`);
  }
  console.log("Seed done.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
