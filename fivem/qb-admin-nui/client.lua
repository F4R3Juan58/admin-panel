local display = false
local backendResource = 'qb-admin-backend'

RegisterCommand('adminpanel', function()
    display = not display
    SetNuiFocus(display, display)
    SendNUIMessage({ action = 'toggle', visible = display })
end)

RegisterKeyMapping('adminpanel', 'Abrir Admin Panel', 'keyboard', 'F10')

RegisterNUICallback('executeAction', function(data, cb)
    TriggerServerEvent('qb-admin-backend:executeAction', data)
    cb({ ok = true })
end)

RegisterNUICallback('fetchPlayers', function(_, cb)
    TriggerServerEvent('qb-admin-backend:fetchPlayers')
    local done = false
    RegisterNetEvent('qb-admin-backend:playersResponse', function(players)
        if done then return end
        done = true
        cb(players)
    end)
end)

RegisterNUICallback('fetchStats', function(_, cb)
    local players = {} -- fallback
    cb({ players = #players, bankTotal = 0, cashTotal = 0, actionsTotal = 0 })
end)

RegisterNUICallback('fetchBans', function(_, cb)
    cb(TriggerServerCallback and TriggerServerCallback('qb-admin-backend:getBans') or {})
end)

RegisterNUICallback('fetchLogs', function(_, cb)
    cb(TriggerServerCallback and TriggerServerCallback('qb-admin-backend:getLogs') or {})
end)

RegisterNUICallback('fetchChat', function(_, cb)
    cb(TriggerServerCallback and TriggerServerCallback('qb-admin-backend:getChat') or {})
end)

RegisterNUICallback('postChat', function(payload, cb)
    TriggerServerEvent('qb-admin-backend:chat:send', payload)
    cb({ ok = true })
end)

RegisterNUICallback('hideFrame', function(_, cb)
    display = false
    SetNuiFocus(false, false)
    cb({})
end)
