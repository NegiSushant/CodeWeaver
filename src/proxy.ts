import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected =
    pathname.startsWith("/chat") || pathname.startsWith("/graph");

  if (isProtected) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    });

    const sessionCookie =
      request.cookies.get("next-auth.session-token")?.value ||
      request.cookies.get("__Secure-next-auth.session-token")?.value ||
      request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value;

    if (!token && !sessionCookie) {
      const signInUrl = new URL("/signin", request.nextUrl.origin);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/chat/:path*", "/chat", "/graph/:path*", "/graph"],
};

