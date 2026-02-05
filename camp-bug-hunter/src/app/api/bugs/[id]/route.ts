import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BugRepository } from "@/lib/bugRepository";
import { adminSessionCookieName, getAdminSession } from "@/lib/adminSession";
import { prisma } from "@/lib/prisma";
import type { Bug, Status } from "@/types/bug";

const repo = new BugRepository();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const { searchParams } = new URL(request.url);
  const includeHidden = searchParams.get("includeHidden") === "true";
  const cookieStore = await cookies();
  const adminSession = getAdminSession(cookieStore.get(adminSessionCookieName)?.value);
  if (includeHidden && !adminSession) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const bug = await repo.get(id, { includeHidden: includeHidden && Boolean(adminSession) });
  if (!bug) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(bug);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const cookieStore = await cookies();
    const isAdmin = Boolean(getAdminSession(cookieStore.get(adminSessionCookieName)?.value));
    const body = await request.json();
    const status = isAdmin ? (body.status as Status | undefined) : undefined;
    const hidden = isAdmin && typeof body.hidden === "boolean" ? body.hidden : undefined;
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const reproductionSteps = typeof body.reproductionSteps === "string" ? body.reproductionSteps.trim() : "";
    const severity = body.severity as Bug["severity"] | undefined;
    const evidenceLinks = Array.isArray(body.evidenceLinks)
      ? body.evidenceLinks.filter((link: unknown) => typeof link === "string" && link.trim().length > 0)
      : undefined;
    const minecraftIgn = typeof body.minecraftIgn === "string" ? body.minecraftIgn.trim() : "";
    if (!isAdmin) {
      if (!minecraftIgn) {
        return NextResponse.json({ error: "Missing owner" }, { status: 400 });
      }
      const existing = await repo.get(id, { includeHidden: true });
      if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
      if (existing.minecraftIgn !== minecraftIgn) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    if (!status && hidden === undefined && !title && !description && !reproductionSteps && !evidenceLinks && !severity) {
      return NextResponse.json({ error: "Missing update fields" }, { status: 400 });
    }
    const existing = isAdmin && status ? await repo.get(id, { includeHidden: true }) : null;
    const updated = await repo.update(id, {
      status,
      hidden,
      title: title || undefined,
      description: description || undefined,
      reproductionSteps: reproductionSteps || undefined,
      evidenceLinks,
      severity: severity || undefined,
    });
    if (!updated) return NextResponse.json({ error: "Update failed" }, { status: 500 });
    if (
      status === "FIXED" &&
      existing &&
      existing.status !== "FIXED" &&
      existing.status !== "NOT_A_BUG"
    ) {
      try {
        await prisma.user.update({
          where: { minecraftUsername: existing.minecraftIgn },
          data: { rewardBalance: { increment: 1 } },
        });
      } catch {
        return NextResponse.json(updated);
      }
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Update error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const cookieStore = await cookies();
    const isAdmin = Boolean(getAdminSession(cookieStore.get(adminSessionCookieName)?.value));
    if (!isAdmin) {
      const minecraftIgn = searchParams.get("minecraftIgn");
      if (!minecraftIgn) return NextResponse.json({ error: "Missing owner" }, { status: 400 });
      const existing = await repo.get(id, { includeHidden: true });
      if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
      if (existing.minecraftIgn !== minecraftIgn) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    const removed = await repo.remove(id);
    if (!removed) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete error" }, { status: 500 });
  }
}
