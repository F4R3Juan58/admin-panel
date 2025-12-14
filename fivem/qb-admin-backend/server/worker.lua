local Queue = require 'server.queue'
local Actions = require 'server.actions'
local Config = require 'shared.config'

local Worker = {}
local running = false

local function process(action)
    Queue.markRunning(action.id)
    local ok, err = pcall(function()
        Actions.dispatch(action)
    end)
    if ok then
        Queue.markDone(action.id, { ok = true })
    else
        print('Action failed: ' .. tostring(err))
        Queue.markFailed(action.id, err)
    end
end

function Worker.start()
    if running then return end
    running = true
    CreateThread(function()
        while running do
            local nextAction = Queue.claim(Config.WorkerId)
            if nextAction then
                process(nextAction)
            end
            Wait(Config.ClaimInterval)
        end
    end)
end

return Worker
