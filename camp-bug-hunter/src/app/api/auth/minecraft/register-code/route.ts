import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function generateCode(length: number) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += alphabet[bytes[i] % alphabet.length];
  }
  return code;
}

export async function POST(request: Request) {
  try {
    const token = process.env.MC_PLUGIN_TOKEN;
    if (token) {
      const provided = request.headers.get("x-plugin-token");
      if (!provided || provided !== token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await request.json();
    const required = ["minecraftUsername", "playerUuid"];
    for (const key of required) {
      if (!body[key]) {
        return NextResponse.json({ error: `Missing field: ${key}` }, { status: 400 });
      }
    }

    const minecraftUsername = String(body.minecraftUsername).trim();
    const playerUuid = String(body.playerUuid).trim();
    if (!minecraftUsername || !playerUuid) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await prisma.registrationCode.deleteMany({
      where: {
        playerUuid,
        usedAt: null,
      },
    });

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = generateCode(8);
      const codeHash = createHash("sha256").update(code).digest("hex");
      try {
        await prisma.registrationCode.create({
          data: {
            minecraftUsername,
            playerUuid,
            codeHash,
            expiresAt,
          },
        });
        return NextResponse.json({ code, expiresAt }, { status: 201 });
      } catch (error) {
        const codeConflict =
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          (error as { code?: string }).code === "P2002";
        if (!codeConflict) {
          throw error;
        }
      }
    }

    return NextResponse.json({ error: "Unable to create code" }, { status: 500 });
  } catch {
    return NextResponse.json({ error: "Failed to create code" }, { status: 500 });
  }
}
