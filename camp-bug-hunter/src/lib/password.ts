import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashedBuffer = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(hash, "hex");
  if (storedBuffer.length !== hashedBuffer.length) return false;
  return timingSafeEqual(storedBuffer, hashedBuffer);
}
