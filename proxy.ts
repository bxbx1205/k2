import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.ENCRYPTION_KEY || "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
);

const COOKIE_NAME = "vaultid_session";

// Added /sbi to public paths
const publicPaths = ["/", "/login", "/signup", "/verify", "/sbi"];
// Added session read/create and sbi-credit to public paths
const apiPublicPaths = [
  "/api/auth/login", 
  "/api/auth/signup", 
  "/api/verify", 
  "/api/sbi-credit", 
  "/api/session/create"
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Specific dynamic public routes (like /verify/[token] and /api/session/[id])
  if (
    pathname.startsWith("/verify/") || 
    (pathname.startsWith("/api/session/") && !pathname.endsWith("/approve") && !pathname.endsWith("/reject"))
  ) {
    return NextResponse.next();
  }

  // Allow static public paths
  if (publicPaths.some((p) => pathname === p)) {
    // If user is logged in and visits login/signup, redirect to dashboard
    if (pathname === "/login" || pathname === "/signup") {
      const token = request.cookies.get(COOKIE_NAME)?.value;
      if (token) {
        try {
          await jwtVerify(token, JWT_SECRET);
          return NextResponse.redirect(new URL("/dashboard", request.url));
        } catch {
          // Invalid token, let them proceed to login
        }
      }
    }
    return NextResponse.next();
  }

  // Allow static API public paths
  if (apiPublicPaths.some((p) => pathname === p)) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Protect dashboard and other routes (including /api/session/[id]/approve)
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    // Invalid or expired token
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ],
};
