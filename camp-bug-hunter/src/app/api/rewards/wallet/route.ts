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
    if (!minecraftUsername || !Number.isFinite(amount) || amount === 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const updated = await prisma.$transaction(async (tx) => {
      const current = await tx.user.findUnique({
        where: { minecraftUsername },
        select: { rewardBalance: true },
      });
      if (!current) {
        throw new Error("USER_NOT_FOUND");
      }
      const nextBalance = Math.max(0, current.rewardBalance + amount);
      return tx.user.update({
        where: { minecraftUsername },
        data: { rewardBalance: nextBalance },
        select: { rewardBalance: true },
      });
    });
    return NextResponse.json({ balance: updated.rewardBalance });
  } catch (error) {
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update balance" }, { status: 500 });
  }
}
