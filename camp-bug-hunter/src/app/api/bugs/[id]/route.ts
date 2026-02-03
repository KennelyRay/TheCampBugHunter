import { NextResponse } from "next/server";
import { BugRepository } from "@/lib/bugRepository";
import type { Status } from "@/types/bug";

const repo = new BugRepository();

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const includeHidden = searchParams.get("includeHidden") === "true";
  const bug = await repo.get(id, { includeHidden });
  if (!bug) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(bug);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const status = body.status as Status | undefined;
    const hidden = typeof body.hidden === "boolean" ? body.hidden : undefined;
    if (!status && hidden === undefined) {
      return NextResponse.json({ error: "Missing update fields" }, { status: 400 });
    }
    const updated = await repo.update(id, {
      status,
      hidden,
    });
    if (!updated) return NextResponse.json({ error: "Update failed" }, { status: 500 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Update error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const removed = await repo.remove(id);
    if (!removed) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete error" }, { status: 500 });
  }
}
