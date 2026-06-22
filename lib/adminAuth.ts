import { NextRequest } from "next/server";

async function sessionToken(): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(process.env.ADMIN_PASSWORD ?? ""),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode("grademysite-admin-v1"));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isAuthed(req: NextRequest): Promise<boolean> {
  const cookie = req.cookies.get("admin-auth")?.value;
  if (!cookie) return false;
  return cookie === (await sessionToken());
}

export { sessionToken };
