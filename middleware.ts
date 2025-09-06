import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
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
