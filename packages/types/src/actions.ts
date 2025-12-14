export const ActionStatus = {
  PENDING: 'PENDING',
  CLAIMED: 'CLAIMED',
  RUNNING: 'RUNNING',
  DONE: 'DONE',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

export type ActionStatus = (typeof ActionStatus)[keyof typeof ActionStatus];

export const ActionSource = {
  NUI: 'NUI',
  WEB: 'WEB',
} as const;

export type ActionSource = (typeof ActionSource)[keyof typeof ActionSource];

export const ActionType = {
  ADMIN_TAG: 'ADMIN_TAG',
  PLAYER_NAMES: 'PLAYER_NAMES',
  PLAYER_SKELETON: 'PLAYER_SKELETON',
  ANNOUNCE: 'ANNOUNCE',
  REVIVE_ALL: 'REVIVE_ALL',
  CLEAR_NEARBY: 'CLEAR_NEARBY',
  IDENTIFY_WEAPON: 'IDENTIFY_WEAPON',
  NOCLIP: 'NOCLIP',
  GODMODE_SELF: 'GODMODE_SELF',
  OBJECT_MODE: 'OBJECT_MODE',
  REVIVE: 'REVIVE',
  HEAL: 'HEAL',
  EXPLODE: 'EXPLODE',
  KILL: 'KILL',
  SPAWN_VEHICLE: 'SPAWN_VEHICLE',
  DELETE_VEHICLE: 'DELETE_VEHICLE',
  TP_TO_COORDS: 'TP_TO_COORDS',
  GIVE_WEAPON: 'GIVE_WEAPON',
  GIVE_ITEM: 'GIVE_ITEM',
  GODMODE_TARGET: 'GODMODE_TARGET',
  FREEZE: 'FREEZE',
  PLAY_SOUND: 'PLAY_SOUND',
  SHOW_IMAGE: 'SHOW_IMAGE',
  GIVE_MONEY: 'GIVE_MONEY',
  SET_WEATHER: 'SET_WEATHER',
  SET_TIME: 'SET_TIME',
  KICK: 'KICK',
  BAN: 'BAN',
  MESSAGE: 'MESSAGE',
  WARN: 'WARN',
  ANNOUNCE_TARGET: 'ANNOUNCE_TARGET',
  CLEAR_ENTITIES: 'CLEAR_ENTITIES',
  SET_TASK: 'SET_TASK',
  REPAIR_VEHICLE: 'REPAIR_VEHICLE',
  SET_FUEL: 'SET_FUEL',
  UNBAN: 'UNBAN',
} as const;

export type ActionType = (typeof ActionType)[keyof typeof ActionType];

export interface ActionRequestPayloads {
  [ActionType.ADMIN_TAG]: { enabled: boolean };
  [ActionType.PLAYER_NAMES]: { enabled: boolean };
  [ActionType.PLAYER_SKELETON]: { enabled: boolean };
  [ActionType.ANNOUNCE]: { message: string };
  [ActionType.REVIVE_ALL]: Record<string, never>;
  [ActionType.CLEAR_NEARBY]: { radius: number };
  [ActionType.IDENTIFY_WEAPON]: Record<string, never>;
  [ActionType.NOCLIP]: { enabled: boolean };
  [ActionType.GODMODE_SELF]: { enabled: boolean };
  [ActionType.OBJECT_MODE]: { enabled: boolean };
  [ActionType.REVIVE]: { targetId: string };
  [ActionType.HEAL]: { targetId: string };
  [ActionType.EXPLODE]: { targetId: string };
  [ActionType.KILL]: { targetId: string };
  [ActionType.SPAWN_VEHICLE]: { model: string; plate?: string };
  [ActionType.DELETE_VEHICLE]: { targetId?: string };
  [ActionType.TP_TO_COORDS]: { targetId?: string; coords: [number, number, number] };
  [ActionType.GIVE_WEAPON]: { targetId: string; weapon: string; ammo?: number };
  [ActionType.GIVE_ITEM]: { targetId: string; item: string; amount: number };
  [ActionType.GODMODE_TARGET]: { targetId: string; enabled: boolean };
  [ActionType.FREEZE]: { targetId: string; enabled: boolean };
  [ActionType.PLAY_SOUND]: { targetId?: string; sound: string; volume?: number };
  [ActionType.SHOW_IMAGE]: { targetId: string; url: string };
  [ActionType.GIVE_MONEY]: { targetId: string; account: 'cash' | 'bank'; amount: number };
  [ActionType.SET_WEATHER]: { weather: string };
  [ActionType.SET_TIME]: { hour: number; minute: number };
  [ActionType.KICK]: { targetId: string; reason: string };
  [ActionType.BAN]: { targetId: string; reason: string; expiresAt?: string | null };
  [ActionType.UNBAN]: { banId: number };
  [ActionType.MESSAGE]: { targetId: string; message: string };
  [ActionType.WARN]: { targetId: string; reason: string };
  [ActionType.ANNOUNCE_TARGET]: { targetId: string; message: string };
  [ActionType.CLEAR_ENTITIES]: { radius: number };
  [ActionType.SET_TASK]: { targetId: string; task: string };
  [ActionType.REPAIR_VEHICLE]: { targetId?: string };
  [ActionType.SET_FUEL]: { targetId?: string; fuel: number };
}

export interface ActionRequest<T extends ActionType = ActionType> {
  requestId: string;
  actorCitizenId?: string;
  actorName?: string;
  actorIdentifier?: string;
  actionType: T;
  payload: ActionRequestPayloads[T];
  source: ActionSource;
}

export interface AdminAction extends ActionRequest {
  id: number;
  createdAt: string;
  status: ActionStatus;
  claimedBy?: string;
  claimedAt?: string;
  executedAt?: string;
  result?: unknown;
  error?: string;
}
