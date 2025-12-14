local Queue = require 'server.queue'
local Auth = require 'server.auth'
local Db = require 'server.db'
local Config = require 'shared.config'

local Api = {}
local rateLimits = {}

local function isRateLimited(actorIdentifier, actionType)
    local key = actorIdentifier .. ':' .. actionType
    local now = GetGameTimer()
    local limitCfg = Config.RateLimits[actionType] or Config.RateLimits.default
    if not limitCfg then return false end
    local entry = rateLimits[key] or { count = 0, windowStart = now }
    if now - entry.windowStart > limitCfg.window then
        entry.count = 0
        entry.windowStart = now
    end
    entry.count = entry.count + 1
    rateLimits[key] = entry
    if entry.count > limitCfg.max then
        return true
    end
    return false
end

function Api.handleExecute(src, request)
    local ok, err = Auth.ensurePermission(src)
    if not ok then
        print(('[qb-admin-backend] rejected action: %s'):format(err))
        return
    end
    local player = QBCore.Functions.GetPlayer(src)
    local actor = {
        citizenid = player.PlayerData.citizenid,
        name = player.PlayerData.charinfo.firstname .. ' ' .. player.PlayerData.charinfo.lastname,
        identifier = player.PlayerData.license
    }
    if isRateLimited(actor.identifier, request.actionType) then
        print('[qb-admin-backend] rate limited request')
        return
    end
    local id, duplicate = Queue.insert(actor, request)
    if not id then
        print('[qb-admin-backend] failed to insert action: ' .. tostring(duplicate))
        return
    end
    if duplicate then
        print('[qb-admin-backend] requestId duplicate, ignoring insert')
    end
end

function Api.getPlayers()
    local players = {}
    for _, player in pairs(QBCore.Functions.GetQBPlayers()) do
        players[#players+1] = {
            id = tostring(player.PlayerData.source),
            name = player.PlayerData.charinfo.firstname .. ' ' .. player.PlayerData.charinfo.lastname,
            citizenId = player.PlayerData.citizenid,
            job = player.PlayerData.job.name,
            cash = player.PlayerData.money.cash,
            bank = player.PlayerData.money.bank,
            ping = GetPlayerPing(player.PlayerData.source),
            identifiers = { player.PlayerData.license, player.PlayerData.citizenid }
        }
    end
    return players
end

function Api.getBans()
    return Db.fetchBans()
end

function Api.getStats()
    local players = #Api.getPlayers()
    return {
        players = players,
        bankTotal = 0,
        cashTotal = 0,
        actionsTotal = Db.countActions(),
        ramUsageMb = nil,
        cpuUsage = nil
    }
end

function Api.getLogs()
    return MySQL.query.await('SELECT id, action_type as actionType, actor_name as actorName, status, created_at as createdAt FROM admin_actions ORDER BY id DESC LIMIT 50')
end

function Api.getChat()
    return Db.fetchChat()
end

function Api.addChat(src, payload)
    local player = QBCore.Functions.GetPlayer(src)
    if not player then return end
    Db.insertChatMessage({
        citizenid = player.PlayerData.citizenid,
        identifier = player.PlayerData.license,
        name = player.PlayerData.charinfo.firstname .. ' ' .. player.PlayerData.charinfo.lastname,
        message = payload.message
    })
end

RegisterNetEvent('qb-admin-backend:chat:send', function(payload)
    local src = source
    Api.addChat(src, payload)
end)

RegisterNUICallback('executeAction', function(request, cb)
    Api.handleExecute(source, request)
    cb({ ok = true })
end)

RegisterNUICallback('fetchPlayers', function(_, cb)
    cb(Api.getPlayers())
end)

RegisterNUICallback('fetchStats', function(_, cb)
    cb(Api.getStats())
end)

RegisterNUICallback('fetchBans', function(_, cb)
    cb(Api.getBans())
end)

RegisterNUICallback('fetchLogs', function(_, cb)
    cb(Api.getLogs())
end)

RegisterNUICallback('fetchChat', function(_, cb)
    cb(Api.getChat())
end)

RegisterNUICallback('postChat', function(payload, cb)
    Api.addChat(source, payload)
    cb({ ok = true })
end)

return Api
