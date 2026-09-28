/**
 * Canonical public base URL.
 *
 * Single source of truth so the QR code, emailed ticket links, the TV display board and
 * the privacy page can never drift apart. Before this, the display board advertised a
 * hardcoded "antricapil.go.id" while the booking route fell back to the Vercel URL, so
 * the QR in a citizen's email could point at a domain the office does not own.
 *
 * Resolution order: NEXT_PUBLIC_APP_URL (Vercel env, already set to the live domain),
 * then NEXTAUTH_URL (NextAuth convention), then localhost for dev. NEVER include a
 * trailing slash, because callers append paths directly.
 */
const RAW = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

export const APP_URL = RAW.replace(/\/+$/, "");

/** Absolute URL for a citizen-facing ticket / verification link. */
export function appUrl(path: string): string {
  return `${APP_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
