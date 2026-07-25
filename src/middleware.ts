import { type NextRequest } from "next/server";
import { validateSession } from "@/lib/auth";

const SESSION_COOKIE = "studypath_session";

export async function middleware(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value ?? null;

  if (!sessionId) {
    const isAuthPage = request.nextUrl.pathname === "/login";
    const isProtectedRoute = !isAuthPage &&
      request.nextUrl.pathname !== "/" &&
      !request.nextUrl.pathname.startsWith("/api") &&
      !request.nextUrl.pathname.startsWith("/auth");

    if (isProtectedRoute) {
      return Response.redirect(new URL("/login", request.url));
    }
    return new Response(null);
  }

  const { user } = await validateSession(sessionId);

  if (!user) {
    const isProtectedRoute = request.nextUrl.pathname !== "/" &&
      !request.nextUrl.pathname.startsWith("/api") &&
      !request.nextUrl.pathname.startsWith("/login");

    if (isProtectedRoute) {
      return Response.redirect(new URL("/login", request.url));
    }
  }

  const isAuthPage = request.nextUrl.pathname === "/login";
  if (isAuthPage && user) {
    return Response.redirect(new URL("/dashboard", request.url));
  }

  return new Response(null);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
