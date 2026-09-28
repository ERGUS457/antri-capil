import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { ANTREAN_SELECT } from "@/lib/antrean-select";
import { toClientErrorMessage } from "@/lib/client-error";

/**
 * GET /api/verify?token=<qrToken>
 *
 * Counter-clerk ticket verification. ADMIN-only — the clerk scans the citizen's QR, which
 * encodes `/verifikasi/<qrToken>`, and the app calls this endpoint to resolve the token
 * into the ticket record WITH identity (name, masked NIK), which the public projections
 * deliberately never carry.
 *
 * Never broaden this to other roles. The entire point of the public-by-id path is that
 * anonymous callers see queue numbers only; identity comes out here and only here,
 * guarded by the ADMIN-only check below.
 */
export async function GET(req: Request) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Hanya petugas loket (ADMIN) yang dapat memverifikasi tiket." },
        { status: 403 }
      );
    }

    const token = new URL(req.url).searchParams.get("token")?.trim();
    if (!token) return NextResponse.json({ error: "Token tiket wajib diisi." }, { status: 400 });
    if (token.length > 64) return NextResponse.json({ error: "Token tidak valid." }, { status: 400 });

    const antrean = await prisma.antrean.findFirst({
      where: { qrToken: token },
      // Explicit allowlist, same as every other Antrean read: never `include: { user: true }`,
      // which would serialise the citizen's bcrypt password hash (2026-09-28 audit).
      select: ANTREAN_SELECT,
    });
    if (!antrean) return NextResponse.json({ error: "Tiket tidak ditemukan. Periksa QR atau kode tiket." }, { status: 404 });

    return NextResponse.json(antrean);
  } catch (e: unknown) {
    console.error("GET /api/verify error", e);
    return NextResponse.json({ error: toClientErrorMessage(e) }, { status: 500 });
  }
}
