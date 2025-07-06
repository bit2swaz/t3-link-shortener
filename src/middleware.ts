import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { type NextRequest } from "next/server";

// Add paths that require authentication
const authPaths = ["/dashboard", "/analytics"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Check if path requires authentication
  if (authPaths.some((p) => path.startsWith(p))) {
    const token = await getToken({ req });

    if (!token) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }
  }

  // Handle slug redirects - redirect root level slugs to /r/[slug]
  const slugMatch = /^\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (
    slugMatch &&
    !authPaths.some((p) => path.startsWith(p)) &&
    path !== "/login" &&
    path !== "/signup" &&
    path !== "/" &&
    !path.startsWith("/_next") &&
    !path.startsWith("/api")
  ) {
    const slug = slugMatch[1];
    return NextResponse.redirect(new URL(`/r/${slug}`, req.url));
  }

  return NextResponse.next();
}

// Configure paths that trigger the middleware
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api/auth/* (authentication routes)
     * 2. /_next/* (Next.js internals)
     * 3. /static/* (static files)
     * 4. /favicon.ico, /robots.txt (static files)
     */
    "/((?!api/auth|_next|static|favicon.ico|robots.txt).*)",
  ],
};
