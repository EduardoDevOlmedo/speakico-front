import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";


function getCookie(req: NextRequest, name: string) {
  const cookieHeader = req.headers.get("cookie"); 
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split("; ").reduce<Record<string, string>>((acc, c) => {
    const [key, ...v] = c.split("=");
    acc[key] = v.join("="); 
    return acc;
  }, {});

  return cookies[name] || null;
}



export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/") return NextResponse.next();

  let token = getCookie(req, "token");

  const secretString = process.env.NEXT_PUBLIC_JWT_SECRET;
  if (!token || !secretString) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    const secret = new TextEncoder().encode(secretString);
    await jwtVerify(token, secret);
  } catch (error) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/chat/:path*",
    "/practice/:path*",
    "/cards/:path*",
    "/dashboard/:path*",
    "/",
  ],
};
