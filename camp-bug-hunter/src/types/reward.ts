export interface Reward {
  id: string;
  createdAt: string;
  name: string;
  cost: number;
  description: string;
  iconUrl: string;
  command: string;
  stock: number;
  active: boolean;
  redeemedCount?: number;
  remainingStock?: number | null;
}
