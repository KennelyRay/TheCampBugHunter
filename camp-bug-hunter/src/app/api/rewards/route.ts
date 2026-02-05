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
      where: includeInactive ? undefined : { active: true },
      orderBy: { cost: "asc" },
    });
    return NextResponse.json(rewards);
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
    const cost = Number(body.cost);
    if (!name || !description || !iconUrl || !Number.isFinite(cost) || cost <= 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const reward = await prisma.reward.create({
      data: { name, description, iconUrl, cost },
    });
    return NextResponse.json(reward);
  } catch {
    return NextResponse.json({ error: "Failed to create reward" }, { status: 500 });
  }
}
