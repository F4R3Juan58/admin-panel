local Db = require 'server.db'

return function(action)
    for _, player in pairs(QBCore.Functions.GetQBPlayers()) do
        TriggerClientEvent('hospital:client:Revive', player.PlayerData.source)
    end
    Db.insertLog(action.id, 'info', 'revived all players')
end
