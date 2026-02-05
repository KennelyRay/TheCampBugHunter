import { createHmac, timingSafeEqual } from "node:crypto";

export const adminSessionCookieName = "camp_admin";

type AdminSession = {
  id: string;
  minecraftUsername: string;
  isAdmin: true;
  exp: number;
};

const secret = process.env.ADMIN_SESSION_SECRET ?? process.env.DATABASE_URL ?? "";

function base64UrlEncode(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replaceAll("=", "")
    .replaceAll("+", "-")
    .replaceAll("/", "_");
}

function base64UrlDecode(input: string) {
  const padded = input.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  return Buffer.from(padded, "base64").toString("utf8");
}

function sign(payload: string) {
  return base64UrlEncode(createHmac("sha256", secret).update(payload).digest());
}

export function createAdminSession(user: { id: string; minecraftUsername: string; isAdmin?: boolean }) {
  if (!user.isAdmin || !secret) return null;
  const exp = Date.now() + 1000 * 60 * 60 * 8;
  const payload = base64UrlEncode(
    JSON.stringify({
      id: user.id,
      minecraftUsername: user.minecraftUsername,
      isAdmin: true,
      exp,
    })
  );
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function getAdminSession(token?: string | null): AdminSession | null {
  if (!token || !secret) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== signatureBuffer.length) return null;
  if (!timingSafeEqual(expectedBuffer, signatureBuffer)) return null;
  try {
    const data = JSON.parse(base64UrlDecode(payload)) as AdminSession;
    if (!data?.isAdmin) return null;
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}
