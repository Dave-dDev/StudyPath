import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "studypath_session";

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value ?? null;

  if (!sessionId) {
    const isAuthPage = request.nextUrl.pathname === "/login";
    const isProtectedRoute = !isAuthPage &&
      request.nextUrl.pathname !== "/" &&
      !request.nextUrl.pathname.startsWith("/api") &&
      !request.nextUrl.pathname.startsWith("/auth");

    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return res;
  }

  let user: { id: string; email: string } | null = null;
  try {
    const { validateSession } = await import("@/lib/auth");
    const session = await validateSession(sessionId);
    user = session.user;
  } catch {
    // DB unavailable — let the page render and client-side auth handle it
    return res;
  }

  if (!user) {
    const isProtectedRoute = request.nextUrl.pathname !== "/" &&
      !request.nextUrl.pathname.startsWith("/api") &&
      !request.nextUrl.pathname.startsWith("/login");

    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  const isAuthPage = request.nextUrl.pathname === "/login";
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
