CREATE TABLE IF NOT EXISTS admin_actions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  request_id VARCHAR(64) UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  source_type ENUM('NUI','WEB') NOT NULL,
  actor_citizenid VARCHAR(64),
  actor_name VARCHAR(64),
  actor_identifier VARCHAR(128),
  action_type VARCHAR(64) NOT NULL,
  payload JSON,
  status ENUM('PENDING','CLAIMED','RUNNING','DONE','FAILED','CANCELLED') DEFAULT 'PENDING',
  claimed_by VARCHAR(64),
  claimed_at DATETIME,
  executed_at DATETIME,
  result JSON,
  error TEXT,
  INDEX idx_status_created_at (status, created_at),
  INDEX idx_actor_citizenid (actor_citizenid),
  INDEX idx_action_type (action_type),
  INDEX idx_request_id (request_id)
);

CREATE TABLE IF NOT EXISTS admin_bans (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  citizenid VARCHAR(64),
  identifier VARCHAR(128),
  reason TEXT,
  banned_by VARCHAR(64),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NULL,
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS admin_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  action_id BIGINT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  level VARCHAR(16) DEFAULT 'info',
  message TEXT,
  metadata JSON,
  INDEX idx_action_id (action_id)
);

CREATE TABLE IF NOT EXISTS admin_chat_messages (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  citizenid VARCHAR(64),
  name VARCHAR(64),
  identifier VARCHAR(128),
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS server_stats_snapshots (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  players INT DEFAULT 0,
  bank_total BIGINT DEFAULT 0,
  cash_total BIGINT DEFAULT 0,
  ram_usage_mb INT,
  cpu_usage FLOAT,
  actions_total BIGINT DEFAULT 0
);
