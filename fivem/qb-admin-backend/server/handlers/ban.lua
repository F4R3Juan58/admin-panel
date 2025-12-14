local Db = require 'server.db'

return function(action)
    local payload = json.decode(action.payload or '{}')
    if not payload.targetId then error('targetId required') end
    if not payload.reason then error('reason required') end
    local target = tonumber(payload.targetId)
    if target then
        local player = QBCore.Functions.GetPlayer(target)
        if player then
            Db.addBan({
                citizenid = player.PlayerData.citizenid,
                identifier = player.PlayerData.license,
                reason = payload.reason,
                banned_by = action.actor_name or 'admin',
                expires_at = payload.expiresAt,
            })
            DropPlayer(target, 'Baneado: ' .. payload.reason)
        end
    end
    Db.insertLog(action.id, 'info', 'player banned', payload)
end
