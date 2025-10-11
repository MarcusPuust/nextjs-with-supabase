import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Jäta vahele KÕIK API-teed (sh /notes/api ja /notes/api/)
  if (pathname.startsWith("/api") || pathname.includes("/api")) {
    return NextResponse.next();
  }
  // või: if (/\/api(\/|$)/.test(pathname)) { return NextResponse.next(); }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
