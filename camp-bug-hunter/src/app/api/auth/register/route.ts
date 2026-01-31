import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const required = ["email", "minecraftUsername", "password"];
    for (const key of required) {
      if (!body[key]) {
        return NextResponse.json({ error: `Missing field: ${key}` }, { status: 400 });
      }
    }

    const email = String(body.email).trim().toLowerCase();
    const minecraftUsername = String(body.minecraftUsername).trim();
    const password = String(body.password);

    if (!email || !minecraftUsername || !password) {
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
