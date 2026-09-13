import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Booking, Dashboard, Admin wajib login.
// Booking: warga harus daftar/login dulu → data tersimpan, mudah dipantau.
export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;
  const needsAuth =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/booking");

  if (!needsAuth) return NextResponse.next();

  const token =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value ||
    req.cookies.get("next-auth.session-token")?.value ||
    "";

  if (!token) {
    // simpan tujuan biar balik ke /booking setelah login
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/booking"],
};
