import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BugRepository } from "@/lib/bugRepository";
import { adminSessionCookieName, getAdminSession } from "@/lib/adminSession";
import type { Severity, Status } from "@/types/bug";

const repo = new BugRepository();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as Status | null;
  const severity = searchParams.get("severity") as Severity | null;
  const discordId = searchParams.get("discordId");
  const minecraftIgn = searchParams.get("minecraftIgn");
  const includeHidden = searchParams.get("includeHidden") === "true";
  const cookieStore = await cookies();
  const adminSession = getAdminSession(cookieStore.get(adminSessionCookieName)?.value);
  if (includeHidden && !adminSession) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const bugs = await repo.list({
    status: status ?? undefined,
    severity: severity ?? undefined,
    discordId: discordId ?? undefined,
    minecraftIgn: minecraftIgn ?? undefined,
    includeHidden: includeHidden && Boolean(adminSession),
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
    const evidenceLinks = Array.isArray(body.evidenceLinks)
      ? body.evidenceLinks.filter((link: unknown) => typeof link === "string" && link.trim().length > 0)
      : [];
    const bug = await repo.create({
      discordId: body.discordId,
      minecraftIgn: body.minecraftIgn,
      title: body.title,
      description: body.description,
      reproductionSteps: body.reproductionSteps,
      evidenceLinks,
      severity: body.severity as Severity,
      status: body.status as Status | undefined,
    });
    return NextResponse.json(bug, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create bug" }, { status: 500 });
  }
}
