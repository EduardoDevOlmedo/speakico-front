// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest, res: NextResponse) {
  const { pathname } = req.nextUrl;
  if (pathname === "/") {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;
  const secretString = process.env.NEXT_PUBLIC_JWT_SECRET;
  if (!token || !secretString) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    const secret = new TextEncoder().encode(secretString);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: [
    "/chat/:path*",
    "/practice/:path*",
    "/cards/:path*",
    "/",
  ],
};
