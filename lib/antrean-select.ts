import type { Prisma } from "@prisma/client";

/**
 * Single source of truth for which Antrean columns ever leave the server.
 *
 * The bug this exists to prevent: the queue API used `include: { user: true }`, and Prisma's
 * `true` include serialises EVERY column of the related row — User.password included. An
 * unauthenticated `GET /api/antrean` was therefore publishing every citizen's bcrypt hash, NIK,
 * name and email to the internet (2026-09-28 audit).
 *
 * Use `ANTREAN_SELECT` in every findUnique / findMany / update against Antrean that reaches an
 * HTTP response. Adding a field to the User or Warga model is then safe by default: it will not
 * be exposed until someone deliberately lists it here.
 */
export const ANTREAN_SELECT = {
  id: true,
  nomor: true,
  tanggal: true,
  status: true,
  waktuPanggil: true,
  waktuSelesai: true,
  createdAt: true,
  updatedAt: true,
  layanan: {
    select: {
      id: true,
      kode: true,
      nama: true,
      deskripsi: true,
      kuotaPerJam: true,
    },
  },
  // Never add `password` or `role` here. The citizen-facing ticket page reads name / email / nik.
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      nik: true,
    },
  },
  warga: {
    select: {
      id: true,
      nama: true,
      nik: true,
      email: true,
    },
  },
} satisfies Prisma.AntreanSelect;

export type AntreanPublic = Prisma.AntreanGetPayload<{ select: typeof ANTREAN_SELECT }>;
