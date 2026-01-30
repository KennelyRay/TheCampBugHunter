export type Severity = "LOW" | "MEDIUM" | "HIGH";
export type Status = "BUG" | "FIXED" | "NOT_A_BUG";

export interface Bug {
  id: string;
  createdAt: Date;
  discordId: string;
  minecraftIgn: string;
  title: string;
  description: string;
  reproductionSteps: string;
  severity: Severity;
  status: Status;
}
