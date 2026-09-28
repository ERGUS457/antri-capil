/**
 * Error text safe to return to an HTTP client.
 *
 * The queue API returned `e.message` straight from Prisma and from Node internals, so a
 * constraint violation or a bad payload echoed schema names, column names and absolute server
 * paths back to whoever triggered it. Those details help an attacker map the data model
 * (2026-09-28 audit). The full error is still logged server-side; only the client-facing text
 * changes.
 */

const GENERIC = "Terjadi kesalahan pada server. Silakan coba lagi.";

/** Prisma's own "Known error" codes that describe a client mistake rather than a server fault. */
const CLIENT_MESSAGES: Record<string, string> = {
  P2002: "Data sudah terdaftar (duplikat).",
  P2003: "Data yang dirujuk tidak ditemukan.",
  P2025: "Data tidak ditemukan.",
};

export function toClientErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "code" in err) {
    const code = String((err as { code: unknown }).code);
    if (CLIENT_MESSAGES[code]) return CLIENT_MESSAGES[code];
  }
  return GENERIC;
}
