import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Edge-safe: cek cookie session tanpa import prisma/bcrypt
export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const needsAuth = url.pathname.startsWith("/dashboard") || url.pathname.startsWith("/admin");
  if (!needsAuth) return NextResponse.next();

  const token =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value ||
    req.cookies.get("next-auth.session-token")?.value ||
    "";

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
