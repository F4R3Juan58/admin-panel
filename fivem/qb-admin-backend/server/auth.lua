local Config = require 'shared.config'

local Auth = {}

local function hasJobPermission(playerJob)
    return Config.AllowedJobs[playerJob] == true
end

function Auth.ensurePermission(src)
    local player = QBCore.Functions.GetPlayer(src)
    if not player then return false, 'player not found' end
    if not hasJobPermission(player.PlayerData.job.name) then
        return false, 'job not allowed'
    end
    return true
end

return Auth
