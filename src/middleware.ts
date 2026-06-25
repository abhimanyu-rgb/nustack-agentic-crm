import { NextRequest, NextResponse } from "next/server";

// Lightweight gate: bounce unauthenticated users to /login. We only check for
// the presence of the session cookie here (Edge runtime can't hit the DB);
// full validation happens in getCurrentUser() on the server.
const PUBLIC_PATHS = ["/login"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has("nudge_session");
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!hasSession && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  // Already signed in but visiting /login -> send home.
  if (hasSession && isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

// Run on page routes only. All /api routes handle their own auth and return
// JSON (a redirect would corrupt client fetches), and static assets are skipped.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
