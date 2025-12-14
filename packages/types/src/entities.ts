export interface PlayerSummary {
  id: string;
  name: string;
  citizenId: string;
  job: string;
  cash: number;
  bank: number;
  ping?: number;
  identifiers?: string[];
}

export interface PlayerDetail extends PlayerSummary {
  inventory?: Array<{ name: string; amount: number }>;
  position?: [number, number, number];
  health?: number;
  armor?: number;
}

export interface BanEntry {
  id: number;
  citizenId?: string;
  identifier?: string;
  reason: string;
  bannedBy: string;
  createdAt: string;
  expiresAt?: string | null;
  active: boolean;
}

export interface ServerStats {
  players: number;
  bankTotal: number;
  cashTotal: number;
  ramUsageMb?: number;
  cpuUsage?: number;
  actionsTotal: number;
}

export interface AdminLogEntry {
  id: number;
  actionType: string;
  createdAt: string;
  actorName?: string;
  status: string;
  result?: unknown;
  error?: string;
}

export interface ChatMessage {
  id: number;
  citizenId?: string;
  name: string;
  identifier?: string;
  message: string;
  createdAt: string;
}
