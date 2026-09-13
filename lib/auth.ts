import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "@/lib/db"

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
      async authorize(credentials) {
        const identifier = (credentials?.email as string)?.trim()
        const password = credentials?.password as string
        if (!identifier || !password) return null
        const isEmail = identifier.includes("@")
        const user = await prisma.user.findFirst({
          where: isEmail ? { email: identifier } : { nik: identifier },
        })
        if (!user) return null
        const ok = await bcrypt.compare(password, user.password)
        if (!ok) return null
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
