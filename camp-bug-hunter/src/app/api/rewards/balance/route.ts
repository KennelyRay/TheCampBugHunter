import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const minecraftUsername = searchParams.get("minecraftUsername");
    if (!minecraftUsername) {
      return NextResponse.json({ error: "Missing user" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({
      where: { minecraftUsername },
      select: { rewardBalance: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ balance: user.rewardBalance });
  } catch {
    return NextResponse.json({ error: "Failed to load balance" }, { status: 500 });
  }
}
