/**
 * In-memory sliding-window rate limiter for the login endpoint.
 *
 * The credentials provider in lib/auth.ts had no brute-force protection at all: any number of
 * password guesses could be made against a known email or NIK (the NIK is a 16-digit public
 * identifier in Indonesia, so the username space is enumerable by design).
 *
 * Scope and limits — this is deliberately modest, sized for a village government office:
 *   10 attempts per identifier per 15 minutes, and 30 per source IP per 15 minutes.
 *
 * Known limitation: the counters live in this process's memory, so on a serverless deployment
 * (Vercel) each cold start begins with an empty window and multiple concurrent instances do not
 * share state. That raises the practical limit for a determined attacker but does not remove the
 * cheap protection. If this app ever carries real citizen data at scale, move the counters to the
 * database (or Upstash) so the limit survives restarts and is shared across instances.
 */

type Bucket = { hits: number[] };
type Store = { perIdentifier: Map<string, Bucket>; perIp: Map<string, Bucket> };

// Survives dev-mode module reloads so a restart does not hand an attacker a fresh window.
const globalStore = globalThis as unknown as { __antriLoginLimiter?: Store };

function store(): Store {
  if (!globalStore.__antriLoginLimiter) {
    globalStore.__antriLoginLimiter = {
      perIdentifier: new Map(),
      perIp: new Map(),
    };
  }
  return globalStore.__antriLoginLimiter;
}

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_IDENTIFIER = 10;
const MAX_PER_IP = 30;

function hit(map: Map<string, Bucket>, key: string, now: number): number {
  let bucket = map.get(key);
  if (!bucket) {
    bucket = { hits: [] };
    map.set(key, bucket);
  }
  // Drop timestamps that have fallen out of the window, then RECORD this attempt. Recording is
  // the load-bearing part: returning the pruned count without pushing the new timestamp leaves
  // bucket.hits permanently empty, so the counter never rises and the limiter never throttles.
  const cutoff = now - WINDOW_MS;
  bucket.hits = bucket.hits.filter((t) => t > cutoff);
  bucket.hits.push(now);
  return bucket.hits.length;
}

/**
 * Drop buckets that no longer hold any in-window attempt, so a long-running instance does not
 * accumulate one dead Map entry per identifier it has ever seen.
 */
function sweep(s: Store, now: number): void {
  const cutoff = now - WINDOW_MS;
  for (const map of [s.perIdentifier, s.perIp]) {
    for (const [key, bucket] of map) {
      bucket.hits = bucket.hits.filter((t) => t > cutoff);
      if (bucket.hits.length === 0) map.delete(key);
    }
  }
}

let lastSweep = 0;
const SWEEP_INTERVAL_MS = 60 * 1000;

export type RateLimitVerdict = { ok: true } | { ok: false; retryAfterSeconds: number };

/**
 * Count one login attempt and report whether it is allowed to proceed.
 * Call this BEFORE running bcrypt so the expensive hash is skipped for throttled attempts.
 */
export function checkLoginRateLimit(identifier: string, ip: string | null): RateLimitVerdict {
  const now = Date.now();
  const s = store();
  const idKey = identifier.trim().toLowerCase().slice(0, 128);
  const ipKey = (ip || "unknown").slice(0, 64);

  if (now - lastSweep > SWEEP_INTERVAL_MS) {
    sweep(s, now);
    lastSweep = now;
  }

  const idCount = hit(s.perIdentifier, idKey, now);
  const ipCount = hit(s.perIp, ipKey, now);

  if (idCount > MAX_PER_IDENTIFIER) {
    return { ok: false, retryAfterSeconds: Math.ceil(WINDOW_MS / 1000) };
  }
  if (ipCount > MAX_PER_IP) {
    return { ok: false, retryAfterSeconds: Math.ceil(WINDOW_MS / 1000) };
  }
  return { ok: true };
}

/**
 * Drop the counters for an identifier after a successful login so a legitimate user who fumbled
 * their password a few times is not left sitting on a nearly-exhausted window.
 */
export function clearLoginRateLimit(identifier: string): void {
  const s = store();
  s.perIdentifier.delete(identifier.trim().toLowerCase().slice(0, 128));
}
