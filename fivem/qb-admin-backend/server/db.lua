local Db = {}

function Db.insertAction(action)
    local result = MySQL.insert.await('INSERT INTO admin_actions (request_id, source_type, actor_citizenid, actor_name, actor_identifier, action_type, payload, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', {
        action.requestId,
        action.source,
        action.actorCitizenId,
        action.actorName,
        action.actorIdentifier,
        action.actionType,
        json.encode(action.payload or {}),
        'PENDING'
    })
    return result
end

function Db.findActionByRequestId(requestId)
    return MySQL.single.await('SELECT * FROM admin_actions WHERE request_id = ?', { requestId })
end

function Db.claimNext(workerId)
    local query = [[
        UPDATE admin_actions
        SET status = 'CLAIMED', claimed_by = ?, claimed_at = NOW()
        WHERE id = (
            SELECT id FROM admin_actions WHERE status = 'PENDING' ORDER BY created_at ASC LIMIT 1
        )
    ]]
    local rowsChanged = MySQL.update.await(query, { workerId })
    if rowsChanged == 0 then return nil end
    return MySQL.single.await('SELECT * FROM admin_actions WHERE status = "CLAIMED" AND claimed_by = ? ORDER BY claimed_at DESC LIMIT 1', { workerId })
end

function Db.updateStatus(id, status, result, errorMsg)
    MySQL.update.await('UPDATE admin_actions SET status = ?, executed_at = NOW(), result = ?, error = ? WHERE id = ?', {
        status,
        result and json.encode(result) or nil,
        errorMsg,
        id
    })
end

function Db.insertLog(actionId, level, message, metadata)
    MySQL.insert.await('INSERT INTO admin_logs (action_id, level, message, metadata) VALUES (?, ?, ?, ?)', {
        actionId,
        level,
        message,
        metadata and json.encode(metadata) or nil
    })
end

function Db.insertChatMessage(message)
    return MySQL.insert.await('INSERT INTO admin_chat_messages (citizenid, name, identifier, message) VALUES (?, ?, ?, ?)', {
        message.citizenid,
        message.name,
        message.identifier,
        message.message
    })
end

function Db.fetchChat()
    return MySQL.query.await('SELECT * FROM admin_chat_messages ORDER BY id DESC LIMIT 50')
end

function Db.fetchBans()
    return MySQL.query.await('SELECT * FROM admin_bans ORDER BY id DESC LIMIT 50')
end

function Db.addBan(ban)
    return MySQL.insert.await('INSERT INTO admin_bans (citizenid, identifier, reason, banned_by, expires_at, active) VALUES (?, ?, ?, ?, ?, 1)', {
        ban.citizenid,
        ban.identifier,
        ban.reason,
        ban.banned_by,
        ban.expires_at
    })
end

function Db.unban(id)
    MySQL.update.await('UPDATE admin_bans SET active = 0 WHERE id = ?', { id })
end

function Db.countActions()
    local row = MySQL.single.await('SELECT COUNT(*) as total FROM admin_actions')
    return row and row.total or 0
end

return Db
