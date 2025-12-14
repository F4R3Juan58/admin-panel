Config = {}

Config.WorkerId = 'core-worker'
Config.ClaimInterval = 500 -- ms
Config.RateLimits = {
  default = { window = 10000, max = 10 },
  ["BAN"] = { window = 60000, max = 3 },
}

Config.AllowedJobs = {
  ['police'] = true,
  ['admin'] = true,
}

Config.EnabledActions = {
  ADMIN_TAG = true,
  PLAYER_NAMES = true,
  PLAYER_SKELETON = true,
  ANNOUNCE = true,
  REVIVE_ALL = true,
  CLEAR_NEARBY = true,
  IDENTIFY_WEAPON = true,
  NOCLIP = true,
  GODMODE_SELF = true,
  OBJECT_MODE = true,
  REVIVE = true,
  HEAL = true,
  EXPLODE = true,
  KILL = true,
  SPAWN_VEHICLE = true,
  DELETE_VEHICLE = true,
  TP_TO_COORDS = true,
  GIVE_WEAPON = true,
  GIVE_ITEM = true,
  GODMODE_TARGET = true,
  FREEZE = true,
  PLAY_SOUND = true,
  SHOW_IMAGE = true,
  GIVE_MONEY = true,
  SET_WEATHER = true,
  SET_TIME = true,
  KICK = true,
  BAN = true,
  UNBAN = true,
  MESSAGE = true,
  WARN = true,
  ANNOUNCE_TARGET = true,
  CLEAR_ENTITIES = true,
  SET_TASK = true,
  REPAIR_VEHICLE = true,
  SET_FUEL = true,
}
