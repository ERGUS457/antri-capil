import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/db"
import { toClientErrorMessage } from "@/lib/client-error"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, nik, password, role } = body as {
      name?: string
      email?: string
      nik?: string
      password?: string
      role?: string
    }

    if (!name || !email || !password) {
      return NextResponse.json({ error: "name, email, password wajib diisi" }, { status: 400 })
    }
    if (!email.includes("@")) {
      return NextResponse.json({ error: "Format email tidak valid" }, { status: 400 })
    }
    if (nik && (nik.length !== 16 || !/^\d+$/.test(nik))) {
      return NextResponse.json({ error: "NIK harus 16 digit angka" }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 })
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 })
    }
    if (nik) {
      const existingNik = await prisma.user.findFirst({ where: { nik } })
      if (existingNik) {
        return NextResponse.json({ error: "NIK sudah terdaftar" }, { status: 409 })
      }
    }

    // Role escalation is not available over the public registration endpoint at all. An ADMIN
    // account is provisioned offline (prisma/seed-admin.ts) or by promoting an existing user with
    // `hermes`-side SQL; the browser may never choose its own role, and no request-supplied key can
    // grant it. Previously this read ADMIN_SECRET with a hardcoded "capil123" fallback, so anyone who
    // knew the shipped default could POST role:"ADMIN" and mint a full admin account (#audit 2026-09-28).
    let finalRole: "WARGA" | "ADMIN" = "WARGA"
    if (role === "ADMIN") {
      return NextResponse.json(
        { error: "Pendaftaran mandiri tidak dapat membuat akun admin. Hubungi operator Disdukcapil." },
        { status: 403 }
      )
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        nik: nik || null,
        password: hashed,
        role: finalRole as any,
      },
      select: { id: true, email: true, nik: true, name: true, role: true, createdAt: true },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (e: any) {
    console.error("POST /api/register error", e);
    return NextResponse.json({ error: toClientErrorMessage(e) }, { status: 500 });
  }
}
