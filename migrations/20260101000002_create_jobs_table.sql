CREATE TABLE IF NOT EXISTS jobs (
    id              TEXT PRIMARY KEY NOT NULL,
    app_id          TEXT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    description     TEXT NOT NULL DEFAULT '',
    cron_expression TEXT NOT NULL,
    path            TEXT NOT NULL DEFAULT '/',
    method          TEXT NOT NULL DEFAULT 'GET'
                        CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
    headers         TEXT NOT NULL DEFAULT '{}',
    body            TEXT,
    timeout_seconds INTEGER NOT NULL DEFAULT 30
                        CHECK (timeout_seconds >= 1 AND timeout_seconds <= 300),
    retry_count     INTEGER NOT NULL DEFAULT 0
                        CHECK (retry_count >= 0 AND retry_count <= 10),
    enabled         INTEGER NOT NULL DEFAULT 1
                        CHECK (enabled IN (0, 1)),
    last_run_at     TEXT,
    last_run_status TEXT
                        CHECK (last_run_status IS NULL OR
                               last_run_status IN ('success', 'failed', 'timeout', 'cancelled')),
    next_run_at     TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(app_id, name)
);

CREATE INDEX IF NOT EXISTS idx_jobs_app_id ON jobs (app_id);
CREATE INDEX IF NOT EXISTS idx_jobs_enabled_next_run
    ON jobs (enabled, next_run_at)
    WHERE enabled = 1;
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs (created_at DESC);
