import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { adminSessionCookieName, getAdminSession } from "@/lib/adminSession";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const isAdmin = Boolean(getAdminSession(cookieStore.get(adminSessionCookieName)?.value));
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { minecraftUsername: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { minecraftUsername: "asc" },
      select: {
        id: true,
        email: true,
        minecraftUsername: true,
        rewardBalance: true,
      },
    });
    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}
