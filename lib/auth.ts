import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "@/lib/db"
import { checkLoginRateLimit, clearLoginRateLimit } from "@/lib/rate-limit"

// A real bcrypt hash of a value nobody can supply, used only to keep the "no such user" path as
// slow as the "wrong password" path. Cost 10 matches the hashes in the database.
const DUMMY_HASH = "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email / NIK", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const identifier = (credentials?.email as string)?.trim()
        const password = credentials?.password as string
        if (!identifier || !password) return null

        // Throttle before touching the database or running bcrypt: 10 tries per identifier and
        // 30 per source IP per 15 minutes (lib/rate-limit.ts). Without this, a known NIK — a
        // 16-digit public identifier in Indonesia — could be sprayed indefinitely.
        const ip =
          request?.headers?.get?.("x-forwarded-for")?.split(",")[0]?.trim() ??
          request?.headers?.get?.("x-real-ip") ??
          null
        const verdict = checkLoginRateLimit(identifier, ip)
        if (!verdict.ok) return null

        const isEmail = identifier.includes("@")
        const user = await prisma.user.findFirst({
          where: isEmail ? { email: identifier } : { nik: identifier },
        })
        // Compare against a dummy hash when the user is absent so a missing account and a wrong
        // password take the same time; otherwise response latency enumerates valid NIKs.
        const hash = user?.password ?? DUMMY_HASH
        const ok = await bcrypt.compare(password, hash)
        if (!user || !ok) return null

        clearLoginRateLimit(identifier)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          nik: user.nik,
        } as any
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.nik = (user as any).nik
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        ;(session.user as any).id = token.id as string
        ;(session.user as any).role = token.role as string
        ;(session.user as any).nik = token.nik as string | null
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
