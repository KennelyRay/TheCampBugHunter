import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const minecraftUsername = typeof body.minecraftUsername === "string" ? body.minecraftUsername.trim() : "";
    const rewardId = typeof body.rewardId === "string" ? body.rewardId.trim() : "";
    if (!minecraftUsername || !rewardId) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
      select: { cost: true, active: true, command: true },
    });
    if (!reward || !reward.active) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!reward.command?.trim()) {
      return NextResponse.json({ error: "Reward not configured" }, { status: 400 });
    }
    const updated = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { minecraftUsername },
        select: { rewardBalance: true },
      });
      if (!user) {
        return null;
      }
      if (user.rewardBalance < reward.cost) {
        throw new Error("INSUFFICIENT_BALANCE");
      }
      const next = await tx.user.update({
        where: { minecraftUsername },
        data: { rewardBalance: user.rewardBalance - reward.cost },
        select: { rewardBalance: true },
      });
      let resolvedCommand = reward.command.trim();
      resolvedCommand = resolvedCommand
        .replaceAll("{player}", minecraftUsername)
        .replaceAll("{username}", minecraftUsername)
        .replaceAll("{minecraftUsername}", minecraftUsername)
        .trim();
      if (resolvedCommand.startsWith("/")) {
        resolvedCommand = resolvedCommand.slice(1).trim();
      }
      await tx.rewardRedemption.create({
        data: {
          minecraftUsername,
          rewardId,
          command: resolvedCommand,
        },
      });
      return next;
    });
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ balance: updated.rewardBalance });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_BALANCE") {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to redeem reward" }, { status: 500 });
  }
}
