import { NextRequest, NextResponse } from "next/server";
import { sessionToken } from "@/lib/adminAuth";
import { loginRatelimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  // Rate limit login attempts by IP
  if (loginRatelimit) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anonymous";
    const { success } = await loginRatelimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Too many attempts — try again in 15 minutes." },
        { status: 429 }
      );
    }
  }

  const { password } = await req.json();

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = await sessionToken();
  const res = NextResponse.json({ success: true });
  res.cookies.set("admin-auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return res;
}
