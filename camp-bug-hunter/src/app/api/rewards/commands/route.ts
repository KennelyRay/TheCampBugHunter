import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const token = process.env.MC_PLUGIN_TOKEN;
    if (token) {
      const provided = request.headers.get("x-plugin-token");
      if (!provided || provided !== token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
    const pending = await prisma.rewardRedemption.findMany({
      where: { deliveredAt: null },
      orderBy: { createdAt: "asc" },
      take: 25,
      select: { id: true, command: true },
    });
    if (pending.length === 0) {
      return NextResponse.json({ commands: [] });
    }
    await prisma.rewardRedemption.updateMany({
      where: { id: { in: pending.map((entry) => entry.id) } },
      data: { deliveredAt: new Date() },
    });
    return NextResponse.json({ commands: pending });
  } catch {
    return NextResponse.json({ error: "Failed to load commands" }, { status: 500 });
  }
}
