local Db = require 'server.db'
local Config = require 'shared.config'

local Queue = {}

function Queue.insert(actor, request)
    if not Config.EnabledActions[request.actionType] then
        return nil, 'action disabled'
    end
    local existing = Db.findActionByRequestId(request.requestId)
    if existing then
        return existing.id, true
    end
    local id = Db.insertAction({
        requestId = request.requestId,
        source = request.source,
        actorCitizenId = actor.citizenid,
        actorName = actor.name,
        actorIdentifier = actor.identifier,
        actionType = request.actionType,
        payload = request.payload
    })
    return id, false
end

function Queue.claim(workerId)
    return Db.claimNext(workerId)
end

function Queue.markRunning(actionId)
    Db.updateStatus(actionId, 'RUNNING')
end

function Queue.markDone(actionId, result)
    Db.updateStatus(actionId, 'DONE', result)
end

function Queue.markFailed(actionId, errorMsg)
    Db.updateStatus(actionId, 'FAILED', nil, errorMsg)
end

return Queue
