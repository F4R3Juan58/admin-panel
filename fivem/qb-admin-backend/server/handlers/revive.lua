local Db = require 'server.db'

return function(action)
    local payload = json.decode(action.payload or '{}')
    if not payload.targetId then error('targetId required') end
    local target = tonumber(payload.targetId)
    if not target then error('invalid target') end
    TriggerClientEvent('hospital:client:Revive', target)
    Db.insertLog(action.id, 'info', 'player revived', payload)
end
