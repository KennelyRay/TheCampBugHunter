import { NextResponse } from "next/server";
import { BugRepository } from "@/lib/bugRepository";
import type { Severity, Status } from "@/types/bug";

const repo = new BugRepository();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as Status | null;
  const severity = searchParams.get("severity") as Severity | null;
  const discordId = searchParams.get("discordId");
  const includeHidden = searchParams.get("includeHidden") === "true";

  const bugs = await repo.list({
    status: status ?? undefined,
    severity: severity ?? undefined,
    discordId: discordId ?? undefined,
    includeHidden,
  });
  return NextResponse.json(bugs);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const required = ["discordId", "minecraftIgn", "title", "description", "reproductionSteps", "severity"];
    for (const key of required) {
      if (!body[key]) {
        return NextResponse.json({ error: `Missing field: ${key}` }, { status: 400 });
      }
    }
    const bug = await repo.create({
      discordId: body.discordId,
      minecraftIgn: body.minecraftIgn,
      title: body.title,
      description: body.description,
      reproductionSteps: body.reproductionSteps,
      evidenceFileNames: Array.isArray(body.evidenceFileNames) ? body.evidenceFileNames : [],
      videoEvidence: typeof body.videoEvidence === "string" ? body.videoEvidence : null,
      severity: body.severity as Severity,
      status: body.status as Status | undefined,
    });
    return NextResponse.json(bug, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create bug" }, { status: 500 });
  }
}
