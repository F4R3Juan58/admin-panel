import { ActionRequest, AdminAction, BanEntry, ChatMessage, PlayerDetail, PlayerSummary, ServerStats } from '@admin-panel/types';
import { mockAdminApi } from './mock';

export interface AdminApi {
  executeAction: (request: ActionRequest) => Promise<{ ok: boolean; actionId?: number; alreadyExists?: boolean }>;
  getPlayersLive: () => Promise<PlayerSummary[]>;
  getPlayerDetail: (playerId: string) => Promise<PlayerDetail | null>;
  getBans: () => Promise<BanEntry[]>;
  getServerStats: () => Promise<ServerStats>;
  getLogs: () => Promise<AdminAction[]>;
  getChatMessages: () => Promise<ChatMessage[]>;
  postChatMessage: (message: string) => Promise<{ ok: boolean }>;
}

export type AdminApiAdapter = (mode: 'web' | 'nui') => AdminApi;

const isBrowser = typeof window !== 'undefined';

export const createWebApi: AdminApiAdapter = () => {
  if (!isBrowser) return mockAdminApi;

  const fetchJson = async <T>(url: string, options?: RequestInit): Promise<T> => {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return (await res.json()) as T;
  };

  return {
    executeAction: (request) => fetchJson('/api/actions', { method: 'POST', body: JSON.stringify(request) }).catch(() => mockAdminApi.executeAction(request)),
    getPlayersLive: () => fetchJson('/api/players').catch(() => mockAdminApi.getPlayersLive()),
    getPlayerDetail: (playerId: string) => fetchJson(`/api/players/${playerId}`).catch(() => mockAdminApi.getPlayerDetail(playerId)),
    getBans: () => fetchJson('/api/bans').catch(() => mockAdminApi.getBans()),
    getServerStats: () => fetchJson('/api/stats').catch(() => mockAdminApi.getServerStats()),
    getLogs: () => fetchJson('/api/logs').catch(() => mockAdminApi.getLogs()),
    getChatMessages: () => fetchJson('/api/chat').catch(() => mockAdminApi.getChatMessages()),
    postChatMessage: (message: string) => fetchJson('/api/chat', { method: 'POST', body: JSON.stringify({ message }) }).catch(() => mockAdminApi.postChatMessage(message)),
  };
};

const nuiFetch = async <T>(endpoint: string, body?: unknown): Promise<T> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resource = (window as any)?.GetParentResourceName ? (window as any).GetParentResourceName() : 'qb-admin-nui';
  const res = await fetch(`https://${resource}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(body ?? {}),
  });
  return (await res.json()) as T;
};

export const createNuiApi: AdminApiAdapter = () => ({
  executeAction: (request) => nuiFetch('executeAction', request),
  getPlayersLive: () => nuiFetch('fetchPlayers'),
  getPlayerDetail: (playerId: string) => nuiFetch('fetchPlayerDetail', { playerId }),
  getBans: () => nuiFetch('fetchBans'),
  getServerStats: () => nuiFetch('fetchStats'),
  getLogs: () => nuiFetch('fetchLogs'),
  getChatMessages: () => nuiFetch('fetchChat'),
  postChatMessage: (message: string) => nuiFetch('postChat', { message }),
});

export * from '@admin-panel/types';
export { mockAdminApi, newRequestId };
