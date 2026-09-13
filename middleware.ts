import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function middleware(req: any) {
  const session = await auth();
  const url = req.nextUrl.clone();
  
  if (url.pathname.startsWith('/admin')) {
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  
  if (url.pathname.startsWith('/dashboard')) {
    if (!session) return NextResponse.redirect(new URL('/login', req.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
