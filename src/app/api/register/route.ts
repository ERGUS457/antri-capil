import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/db"

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

    // Only allow ADMIN if secret key provided via header or body adminKey — for now allow if role===ADMIN but restrict in prod via env
    let finalRole: "WARGA" | "ADMIN" = "WARGA"
    if (role === "ADMIN") {
      // simple gate: require ADMIN_SECRET env if set
      const adminSecret = process.env.ADMIN_SECRET || "capil123"
      const providedKey = (body as any).adminKey || req.headers.get("x-admin-key")
      if (providedKey !== adminSecret) {
        return NextResponse.json({ error: "Kunci admin tidak valid untuk membuat akun ADMIN" }, { status: 403 })
      }
      finalRole = "ADMIN"
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
    console.error("POST /api/register error", e)
    return NextResponse.json({ error: e.message || "Internal error" }, { status: 500 })
  }
}
