export type Severity = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type Status = "BUG" | "FIXED" | "NOT_A_BUG" | "ON_INVESTIGATION";

export interface Bug {
  id: string;
  createdAt: Date;
  discordId: string;
  minecraftIgn: string;
  title: string;
  description: string;
  reproductionSteps: string;
  evidenceLinks: string[];
  severity: Severity;
  status: Status;
  hidden: boolean;
}
