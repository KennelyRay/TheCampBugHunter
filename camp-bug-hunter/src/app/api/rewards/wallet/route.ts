import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { adminSessionCookieName, getAdminSession } from "@/lib/adminSession";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const isAdmin = Boolean(getAdminSession(cookieStore.get(adminSessionCookieName)?.value));
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await request.json();
    const minecraftUsername = typeof body.minecraftUsername === "string" ? body.minecraftUsername.trim() : "";
    const amount = Number(body.amount);
    if (!minecraftUsername || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const user = await prisma.user.update({
      where: { minecraftUsername },
      data: { rewardBalance: { increment: amount } },
      select: { rewardBalance: true },
    });
    return NextResponse.json({ balance: user.rewardBalance });
  } catch {
    return NextResponse.json({ error: "Failed to update balance" }, { status: 500 });
  }
}
