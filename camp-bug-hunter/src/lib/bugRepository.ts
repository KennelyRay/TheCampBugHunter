import { prisma } from "@/lib/prisma";
import type { Bug, Severity, Status } from "@/types/bug";

export interface BugFilters {
  status?: Status;
  severity?: Severity;
  discordId?: string;
}

export class BugRepository {
  async list(filters: BugFilters = {}): Promise<Bug[]> {
    try {
      const bugs = await prisma.bug.findMany({
        where: {
          status: filters.status,
          severity: filters.severity,
          discordId: filters.discordId,
        },
        orderBy: [{ createdAt: "desc" }],
      });
      return bugs as unknown as Bug[];
    } catch {
      return [];
    }
  }

  async get(id: string): Promise<Bug | null> {
    try {
      const bug = await prisma.bug.findUnique({ where: { id } });
      return (bug ?? null) as unknown as Bug | null;
    } catch {
      return null;
    }
  }

  async create(payload: Omit<Bug, "id" | "createdAt" | "status"> & { status?: Status }): Promise<Bug> {
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
    };
    const bug = await prisma.bug.create({ data });
    return bug as unknown as Bug;
  }

  async updateStatus(id: string, status: Status): Promise<Bug | null> {
    try {
      const bug = await prisma.bug.update({
        where: { id },
        data: { status },
      });
      return bug as unknown as Bug;
    } catch {
      return null;
    }
  }
}
