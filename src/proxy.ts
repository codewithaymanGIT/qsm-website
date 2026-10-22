import { NextResponse, type NextRequest } from "next/server";

// Optimistic check only: no cookie, no admin page. Real verification happens in requireUser().
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin/login")) return NextResponse.next();
  if (!request.cookies.has("qsm_session")) {
    const url = new URL("/admin/login/", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
