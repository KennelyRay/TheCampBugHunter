import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { adminSessionCookieName, createAdminSession } from "@/lib/adminSession";

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

    let user = await prisma.user.findUnique({
      where: { minecraftUsername },
    });

    if (!user) {
      const bootstrapUsername = process.env.DEFAULT_ADMIN_USERNAME?.trim() ?? "";
      const bootstrapPassword = process.env.DEFAULT_ADMIN_PASSWORD ?? "";
      if (bootstrapUsername && bootstrapPassword && minecraftUsername === bootstrapUsername && password === bootstrapPassword) {
        const existingAdmin = await prisma.user.findFirst({
          where: { isAdmin: true },
          select: { id: true },
        });
        if (!existingAdmin) {
          const email = (process.env.DEFAULT_ADMIN_EMAIL?.trim() ?? `${bootstrapUsername.toLowerCase()}@mastercraft.local`).toLowerCase();
          const passwordHash = hashPassword(bootstrapPassword);
          const byUsername = await prisma.user.findUnique({ where: { minecraftUsername: bootstrapUsername } });
          const byEmail = byUsername ? null : await prisma.user.findUnique({ where: { email } });
          const existing = byUsername ?? byEmail;
          user = existing
            ? await prisma.user.update({
                where: { id: existing.id },
                data: { email, minecraftUsername: bootstrapUsername, passwordHash, isAdmin: true },
              })
            : await prisma.user.create({
                data: { email, minecraftUsername: bootstrapUsername, passwordHash, isAdmin: true },
              });
        }
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    let valid = verifyPassword(password, user.passwordHash);
    const allowPlaintextPasswords =
      process.env.ALLOW_PLAINTEXT_PASSWORDS === "true" || process.env.NODE_ENV !== "production";
    if (!valid && allowPlaintextPasswords && user.passwordHash === password) {
      const nextHash = hashPassword(password);
      user = await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: nextHash },
      });
      valid = true;
    }
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const response = NextResponse.json(
      {
        id: user.id,
        email: user.email,
        minecraftUsername: user.minecraftUsername,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
      { status: 200 }
    );
    const session = createAdminSession({
      id: user.id,
      minecraftUsername: user.minecraftUsername,
      isAdmin: user.isAdmin,
    });
    if (session) {
      response.cookies.set(adminSessionCookieName, session, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 8,
      });
    } else {
      response.cookies.set(adminSessionCookieName, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
      });
    }
    return response;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
