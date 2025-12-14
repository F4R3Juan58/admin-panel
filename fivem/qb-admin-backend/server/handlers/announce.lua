local Db = require 'server.db'

return function(action)
    local data = json.decode(action.payload or '{}')
    if not data.message then error('message required') end
    TriggerClientEvent('chat:addMessage', -1, { args = { '[ADMIN]', data.message } })
    Db.insertLog(action.id, 'info', 'announce broadcasted', data)
end
