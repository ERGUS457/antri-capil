import type { Prisma } from "@prisma/client";

/**
 * Single source of truth for which Antrean columns ever leave the server.
 *
 * The bug this exists to prevent: the queue API used `include: { user: true }`, and Prisma's
 * `true` include serialises EVERY column of the related row — User.password included. An
 * unauthenticated `GET /api/antrean` was therefore publishing every citizen's bcrypt hash, NIK,
 * name and email to the internet (2026-09-28 audit).
 *
 * Use one of these projections in every findUnique / findMany / update against Antrean that
 * reaches an HTTP response. Adding a field to the User or Warga model is then safe by default:
 * it will not be exposed until someone deliberately lists it here.
 */

/** Full projection: the ticket owner, or an ADMIN. Carries identity, never credentials. */
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

export type AntreanFull = Prisma.AntreanGetPayload<{ select: typeof ANTREAN_SELECT }>;

/**
 * Public projection: what an anonymous visitor may see. The TV display and a shared or forwarded
 * ticket QR only ever need the queue number, which service, and the status — never the citizen's
 * name, NIK or email, which are government identifiers for Indonesian residents.
 */
export const ANTREAN_PUBLIC_SELECT = {
  id: true,
  nomor: true,
  tanggal: true,
  status: true,
  layanan: {
    select: {
      kode: true,
      nama: true,
    },
  },
} satisfies Prisma.AntreanSelect;

export type AntreanPublic = Prisma.AntreanGetPayload<{ select: typeof ANTREAN_PUBLIC_SELECT }>;

/**
 * May this viewer see the citizen's identity on this record?
 *
 * The ticket page is reachable without a session (the QR code is the whole point of it), so
 * ownership is checked against the record itself rather than assumed. A logged-in citizen sees
 * only their own tickets; an ADMIN sees every row, because the counter clerk needs the NIK to
 * verify the person standing in front of the window.
 */
export function canViewIdentity(
  antrean: { userId: string | null; wargaId: string | null },
  viewer: { id: string | null; role: string | null } | null | undefined
): boolean {
  if (!viewer) return false;
  if (viewer.role === "ADMIN") return true;
  if (!viewer.id) return false;
  return antrean.userId === viewer.id || antrean.wargaId === viewer.id;
}
