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
    const limitParam = Number(searchParams.get("limit") ?? "20");
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 20;
    const pageParam = Number(searchParams.get("page") ?? "1");
    const page = Number.isFinite(pageParam) ? Math.max(1, pageParam) : 1;
    const range = searchParams.get("range") ?? "all";
    const now = new Date();
    let rangeStart: Date | null = null;
    if (range === "day") {
      rangeStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (range === "week") {
      rangeStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === "month") {
      const start = new Date(now);
      start.setMonth(start.getMonth() - 1);
      rangeStart = start;
    } else if (range === "year") {
      const start = new Date(now);
      start.setFullYear(start.getFullYear() - 1);
      rangeStart = start;
    }
    const where = rangeStart ? { createdAt: { gte: rangeStart } } : undefined;
    const total = await prisma.rewardRedemption.count({ where });

    const redemptions = await prisma.rewardRedemption.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
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

    return NextResponse.json({
      logs,
      page,
      total,
      pageCount: Math.max(1, Math.ceil(total / limit)),
    });
  } catch {
    return NextResponse.json({ error: "Failed to load logs" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const isAdmin = Boolean(getAdminSession(cookieStore.get(adminSessionCookieName)?.value));
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const id = typeof body.id === "string" ? body.id.trim() : "";
    const clear = body.clear === true;
    if (id) {
      await prisma.rewardRedemption.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    }
    if (clear) {
      await prisma.rewardRedemption.deleteMany();
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to delete logs" }, { status: 500 });
  }
}
