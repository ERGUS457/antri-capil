import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import pg from "pg";

/**
 * Offline ADMIN provisioning. The public registration endpoint can no longer mint an ADMIN
 * (see src/app/api/register/route.ts), so this is the supported way to create or reset one.
 *
 * Usage (from the repo root, with .env pointing at the target database):
 *   npx tsx prisma/seed-admin.ts
 *
 * Optional env overrides:
 *   ADMIN_EMAIL  (default: admin@disdukcapil.sambas.go.id)
 *   ADMIN_NIK    (default: 6101000000000001)
 *   ADMIN_NAME   (default: Admin Disdukcapil Sambas)
 *   ADMIN_PASSWORD — REQUIRED. There is deliberately no default: a shipped default password is
 *   exactly the hole this script exists to close, so the operator must choose one.
 */

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@disdukcapil.sambas.go.id";
  const nik = process.env.ADMIN_NIK || "6101000000000001";
  const name = process.env.ADMIN_NAME || "Admin Disdukcapil Sambas";
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    console.error("ADMIN_PASSWORD is required. Refusing to create an admin with a default password.");
    console.error("Example:  ADMIN_PASSWORD='<choose-a-strong-one>' npx tsx prisma/seed-admin.ts");
    process.exit(1);
  }
  if (password.length < 12) {
    console.error("ADMIN_PASSWORD must be at least 12 characters.");
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, nik, password: hashed, role: "ADMIN" },
    create: { email, nik, name, password: hashed, role: "ADMIN" },
    select: { id: true, email: true, nik: true, name: true, role: true },
  });

  console.log("ADMIN account ready:");
  console.log(`  email : ${user.email}`);
  console.log(`  nik   : ${user.nik}`);
  console.log(`  name  : ${user.name}`);
  console.log(`  role  : ${user.role}`);
  console.log("\nThe password is never printed. Change it again after first use.");
}

main()
  .catch((e) => {
    console.error("seed-admin failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
