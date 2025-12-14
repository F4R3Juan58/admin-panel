import { ActionRequest, ActionType, AdminAction, BanEntry, ChatMessage, PlayerDetail, PlayerSummary, ServerStats } from '@admin-panel/types';
import { v4 as uuidv4 } from 'uuid';

const now = () => new Date().toISOString();

const mockPlayers: PlayerSummary[] = [
  { id: '1', name: 'John Doe', citizenId: 'CIT123', job: 'police', cash: 500, bank: 2000, ping: 30, identifiers: ['license:abc'] },
  { id: '2', name: 'Jane Smith', citizenId: 'CIT999', job: 'ems', cash: 1200, bank: 15000, ping: 50, identifiers: ['license:def'] },
];

let mockBans: BanEntry[] = [
  { id: 1, citizenId: 'CIT000', identifier: 'license:ban', reason: 'Trolling', bannedBy: 'Console', createdAt: now(), expiresAt: null, active: true },
];

let logs: AdminAction[] = [];
let chat: ChatMessage[] = [
  { id: 1, citizenId: 'CIT123', name: 'John Doe', message: 'Hola admin!', createdAt: now() },
];

export const mockAdminApi = {
  executeAction: async (request: ActionRequest) => {
    const id = logs.length + 1;
    logs = [
      { id, createdAt: now(), status: 'DONE', actionType: request.actionType, result: { ok: true }, ...request },
      ...logs,
    ];
    if (request.actionType === ActionType.BAN) {
      const payload = request.payload as typeof request.payload & { targetId?: string; expiresAt?: string | null };
      mockBans = [
        {
          id: mockBans.length + 1,
          citizenId: payload.targetId,
          identifier: payload.targetId,
          reason: payload.reason,
          bannedBy: request.actorName ?? 'admin',
          createdAt: now(),
          expiresAt: payload.expiresAt ?? null,
          active: true,
        },
        ...mockBans,
      ];
    }
    return { ok: true, actionId: id };
  },
  getPlayersLive: async () => mockPlayers,
  getPlayerDetail: async (playerId: string): Promise<PlayerDetail | null> => {
    const player = mockPlayers.find((p) => p.id === playerId);
    if (!player) return null;
    return { ...player, inventory: [{ name: 'water', amount: 2 }], position: [0, 0, 0], health: 200, armor: 100 };
  },
  getBans: async () => mockBans,
  getServerStats: async (): Promise<ServerStats> => ({ players: mockPlayers.length, bankTotal: 18000, cashTotal: 1700, ramUsageMb: 512, cpuUsage: 12, actionsTotal: logs.length }),
  getLogs: async () => logs,
  getChatMessages: async () => chat,
  postChatMessage: async (message: string) => {
    chat = [{ id: chat.length + 1, name: 'You', message, createdAt: now() }, ...chat];
    return { ok: true };
  },
};

export const newRequestId = () => uuidv4();
