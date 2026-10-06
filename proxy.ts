import { NextRequest, NextResponse } from "next/server";

const COOKIE = "pb_variant";
const variants = ["a", "b", "c"] as const;

export function proxy(request: NextRequest) {
  const forced = request.nextUrl.searchParams.get("variant")?.toLowerCase();
  const existing = request.cookies.get(COOKIE)?.value;
  const variant = variants.includes(forced as (typeof variants)[number])
    ? forced!
    : variants.includes(existing as (typeof variants)[number])
      ? existing!
      : variants[Math.floor(Math.random() * variants.length)];

  const headers = new Headers(request.headers);
  headers.set("x-pingback-variant", variant);
  const response = NextResponse.next({ request: { headers } });
  response.cookies.set(COOKIE, variant, {
    maxAge: 60 * 60 * 24 * 180,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return response;
}

export const config = { matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"] };
