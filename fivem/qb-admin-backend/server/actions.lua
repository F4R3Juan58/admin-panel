local Db = require 'server.db'
local Config = require 'shared.config'
local Handlers = {}

Handlers["ANNOUNCE"] = require 'server.handlers.announce'
Handlers["REVIVE"] = require 'server.handlers.revive'
Handlers["REVIVE_ALL"] = require 'server.handlers.revive_all'
Handlers["BAN"] = require 'server.handlers.ban'
Handlers["UNBAN"] = require 'server.handlers.unban'

local Actions = {}

local function validatePayload(action)
    if not Config.EnabledActions[action.action_type] then
        error('action disabled')
    end
end

function Actions.dispatch(action)
    validatePayload(action)
    local handler = Handlers[action.action_type]
    if not handler then
        Db.insertLog(action.id, 'warn', 'handler missing', { type = action.action_type })
        return
    end
    handler(action)
end

return Actions
