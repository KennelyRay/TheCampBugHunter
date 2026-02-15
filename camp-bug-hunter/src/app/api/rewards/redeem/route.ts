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
    const updated = await prisma.$transaction(async (tx) => {
      const reward = await tx.reward.findUnique({
        where: { id: rewardId },
        select: { cost: true, active: true, command: true, stock: true },
      });
      if (!reward || !reward.active) {
        throw new Error("REWARD_NOT_FOUND");
      }
      if (!reward.command?.trim()) {
        throw new Error("REWARD_NOT_CONFIGURED");
      }
      if (reward.stock === 0) {
        throw new Error("OUT_OF_STOCK");
      }
      if (reward.stock > 0) {
        const redeemedCount = await tx.rewardRedemption.count({ where: { rewardId } });
        if (redeemedCount >= reward.stock) {
          throw new Error("OUT_OF_STOCK");
        }
      }
      const user = await tx.user.findUnique({
        where: { minecraftUsername },
        select: { rewardBalance: true },
      });
      if (!user) {
        throw new Error("USER_NOT_FOUND");
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
    return NextResponse.json({ balance: updated.rewardBalance });
  } catch (error) {
    if (error instanceof Error && (error.message === "REWARD_NOT_FOUND" || error.message === "USER_NOT_FOUND")) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "REWARD_NOT_CONFIGURED") {
      return NextResponse.json({ error: "Reward not configured" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "INSUFFICIENT_BALANCE") {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 409 });
    }
    if (error instanceof Error && error.message === "OUT_OF_STOCK") {
      return NextResponse.json({ error: "Out of stock" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to redeem reward" }, { status: 500 });
  }
}
