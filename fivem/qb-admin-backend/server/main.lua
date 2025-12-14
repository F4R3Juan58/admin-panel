QBCore = exports['qb-core']:GetCoreObject()

local Queue = require 'server.queue'
local Worker = require 'server.worker'
local Api = require 'server.api'

CreateThread(function()
    print('[qb-admin-backend] Booting admin panel backend...')
    Worker.start()
end)

RegisterNetEvent('qb-admin-backend:executeAction', function(request)
    Api.handleExecute(source, request)
end)

RegisterNetEvent('qb-admin-backend:fetchPlayers', function()
    local src = source
    local players = Api.getPlayers()
    TriggerClientEvent('qb-admin-backend:playersResponse', src, players)
end)
