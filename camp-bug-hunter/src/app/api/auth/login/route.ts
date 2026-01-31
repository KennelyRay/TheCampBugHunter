import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const required = ["minecraftUsername", "password"];
    for (const key of required) {
      if (!body[key]) {
        return NextResponse.json({ error: `Missing field: ${key}` }, { status: 400 });
      }
    }

    const minecraftUsername = String(body.minecraftUsername).trim();
    const password = String(body.password);

    const user = await prisma.user.findUnique({
      where: { minecraftUsername },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        minecraftUsername: user.minecraftUsername,
        createdAt: user.createdAt,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
