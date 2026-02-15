import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { adminSessionCookieName, getAdminSession } from "@/lib/adminSession";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";
    const cookieStore = await cookies();
    const isAdmin = Boolean(getAdminSession(cookieStore.get(adminSessionCookieName)?.value));
    if (includeInactive && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const rewards = await prisma.reward.findMany({
      where: includeInactive ? undefined : { active: true, command: { not: "" } },
      orderBy: { cost: "asc" },
    });
    const rewardIds = rewards.map((reward) => reward.id);
    const redemptionCounts =
      rewardIds.length > 0
        ? await prisma.rewardRedemption.groupBy({
            by: ["rewardId"],
            _count: { rewardId: true },
            where: { rewardId: { in: rewardIds } },
          })
        : [];
    const countsByRewardId = new Map(redemptionCounts.map((entry) => [entry.rewardId, entry._count.rewardId]));
    const response = rewards.map((reward) => {
      const redeemedCount = countsByRewardId.get(reward.id) ?? 0;
      const remainingStock = reward.stock < 0 ? null : Math.max(reward.stock - redeemedCount, 0);
      return { ...reward, redeemedCount, remainingStock };
    });
    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "Failed to load rewards" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const isAdmin = Boolean(getAdminSession(cookieStore.get(adminSessionCookieName)?.value));
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const iconUrl = typeof body.iconUrl === "string" ? body.iconUrl.trim() : "";
    const command = typeof body.command === "string" ? body.command.trim() : "";
    const cost = Number(body.cost);
    const stock = body.stock === undefined ? -1 : Number(body.stock);
    const stockValid = Number.isInteger(stock) && (stock === -1 || stock >= 0);
    if (!name || !description || !iconUrl || !command || !Number.isFinite(cost) || cost <= 0 || !stockValid) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const reward = await prisma.reward.create({
      data: { name, description, iconUrl, command, cost, stock },
    });
    const remainingStock = reward.stock < 0 ? null : reward.stock;
    return NextResponse.json({ ...reward, redeemedCount: 0, remainingStock });
  } catch {
    return NextResponse.json({ error: "Failed to create reward" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const isAdmin = Boolean(getAdminSession(cookieStore.get(adminSessionCookieName)?.value));
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const iconUrl = typeof body.iconUrl === "string" ? body.iconUrl.trim() : "";
    const command = typeof body.command === "string" ? body.command.trim() : "";
    const cost = Number(body.cost);
    const stock = body.stock === undefined ? -1 : Number(body.stock);
    const stockValid = Number.isInteger(stock) && (stock === -1 || stock >= 0);
    if (!id || !name || !description || !iconUrl || !command || !Number.isFinite(cost) || cost <= 0 || !stockValid) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const existing = await prisma.reward.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const reward = await prisma.reward.update({
      where: { id },
      data: { name, description, iconUrl, command, cost, stock },
    });
    const redeemedCount = await prisma.rewardRedemption.count({ where: { rewardId: reward.id } });
    const remainingStock = reward.stock < 0 ? null : Math.max(reward.stock - redeemedCount, 0);
    return NextResponse.json({ ...reward, redeemedCount, remainingStock });
  } catch {
    return NextResponse.json({ error: "Failed to update reward" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const isAdmin = Boolean(getAdminSession(cookieStore.get(adminSessionCookieName)?.value));
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id.trim() : "";
    if (!id) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const existing = await prisma.reward.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await prisma.reward.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete reward" }, { status: 500 });
  }
}
