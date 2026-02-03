import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const required = ["email", "minecraftUsername", "password", "verificationCode"];
    for (const key of required) {
      if (!body[key]) {
        return NextResponse.json({ error: `Missing field: ${key}` }, { status: 400 });
      }
    }

    const email = String(body.email).trim().toLowerCase();
    const minecraftUsername = String(body.minecraftUsername).trim();
    const password = String(body.password);
    const verificationCode = String(body.verificationCode).trim().toUpperCase();

    if (!email || !minecraftUsername || !password || !verificationCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { minecraftUsername }],
      },
    });

    if (existing) {
      const conflict =
        existing.email === email
          ? "Email already in use"
          : "Minecraft username already in use";
      return NextResponse.json({ error: conflict }, { status: 409 });
    }

    const now = new Date();
    const codeHash = createHash("sha256").update(verificationCode).digest("hex");
    const codeEntry = await prisma.registrationCode.findFirst({
      where: {
        minecraftUsername,
        codeHash,
        usedAt: null,
      },
    });

    if (!codeEntry) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    if (codeEntry.expiresAt <= now) {
      return NextResponse.json({ error: "Verification code expired" }, { status: 400 });
    }

    await prisma.registrationCode.update({
      where: { id: codeEntry.id },
      data: { usedAt: now },
    });

    const user = await prisma.user.create({
      data: {
        email,
        minecraftUsername,
        passwordHash: hashPassword(password),
      },
      select: {
        id: true,
        email: true,
        minecraftUsername: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
