local Db = require 'server.db'

return function(action)
    local payload = json.decode(action.payload or '{}')
    if not payload.banId then error('banId required') end
    Db.unban(payload.banId)
    Db.insertLog(action.id, 'info', 'ban removed', payload)
end
