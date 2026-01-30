import { NextResponse } from "next/server";
import { BugRepository } from "@/lib/bugRepository";
import type { Status } from "@/types/bug";

const repo = new BugRepository();

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bug = await repo.get(id);
  if (!bug) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(bug);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const status = body.status as Status | undefined;
    if (!status) return NextResponse.json({ error: "Missing status" }, { status: 400 });
    const updated = await repo.updateStatus(id, status);
    if (!updated) return NextResponse.json({ error: "Update failed" }, { status: 500 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Update error" }, { status: 500 });
  }
}
