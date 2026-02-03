import { prisma } from "@/lib/prisma";
import type { Bug, Severity, Status } from "@/types/bug";

export interface BugFilters {
  status?: Status;
  severity?: Severity;
  discordId?: string;
  includeHidden?: boolean;
}

export class BugRepository {
  async list(filters: BugFilters = {}): Promise<Bug[]> {
    try {
      const where = {
        status: filters.status,
        severity: filters.severity,
        discordId: filters.discordId,
        hidden: filters.includeHidden ? undefined : false,
      };
      const bugs = await prisma.bug.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
      });
      return bugs as unknown as Bug[];
    } catch {
      return [];
    }
  }

  async get(id: string, options?: { includeHidden?: boolean }): Promise<Bug | null> {
    try {
      const bug = await prisma.bug.findFirst({
        where: {
          id,
          hidden: options?.includeHidden ? undefined : false,
        },
      });
      return (bug ?? null) as unknown as Bug | null;
    } catch {
      return null;
    }
  }

  async create(
    payload: Omit<Bug, "id" | "createdAt" | "status" | "hidden"> & { status?: Status; hidden?: boolean }
  ): Promise<Bug> {
    const status = payload.status ?? "BUG";
    const data = {
      discordId: payload.discordId,
      minecraftIgn: payload.minecraftIgn,
      title: payload.title,
      description: payload.description,
      reproductionSteps: payload.reproductionSteps,
      evidenceFileNames: payload.evidenceFileNames,
      videoEvidence: payload.videoEvidence ?? null,
      severity: payload.severity,
      status,
      hidden: payload.hidden ?? false,
    };
    const bug = await prisma.bug.create({ data });
    return bug as unknown as Bug;
  }

  async update(id: string, data: { status?: Status; hidden?: boolean }): Promise<Bug | null> {
    try {
      const bug = await prisma.bug.update({
        where: { id },
        data,
      });
      return bug as unknown as Bug;
    } catch {
      return null;
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      await prisma.bug.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
