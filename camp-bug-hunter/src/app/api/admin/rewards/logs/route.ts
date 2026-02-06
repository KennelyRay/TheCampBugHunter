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
    const limitParam = Number(searchParams.get("limit") ?? "50");
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 200) : 50;

    const redemptions = await prisma.rewardRedemption.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        minecraftUsername: true,
        rewardId: true,
        command: true,
        createdAt: true,
        deliveredAt: true,
      },
    });

    const rewardIds = Array.from(new Set(redemptions.map((entry) => entry.rewardId)));
    const rewards = await prisma.reward.findMany({
      where: rewardIds.length > 0 ? { id: { in: rewardIds } } : undefined,
      select: { id: true, name: true, cost: true },
    });

    const rewardById = new Map(rewards.map((reward) => [reward.id, reward]));
    const logs = redemptions.map((entry) => ({
      ...entry,
      reward: rewardById.get(entry.rewardId) ?? null,
    }));

    return NextResponse.json({ logs });
  } catch {
    return NextResponse.json({ error: "Failed to load logs" }, { status: 500 });
  }
}
