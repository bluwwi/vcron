CREATE TABLE IF NOT EXISTS job_runs (
    id              TEXT PRIMARY KEY NOT NULL,
    job_id          TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    status          TEXT NOT NULL
                        CHECK (status IN ('running', 'success', 'failed', 'timeout', 'cancelled')),
    status_code     INTEGER,
    response_body   TEXT,
    request_method  TEXT,
    request_url     TEXT,
    duration_ms     INTEGER,
    error_message   TEXT,
    attempt_number  INTEGER NOT NULL DEFAULT 1,
    started_at      TEXT NOT NULL DEFAULT (datetime('now')),
    finished_at     TEXT
);

CREATE INDEX IF NOT EXISTS idx_job_runs_job_id_started ON job_runs (job_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_runs_started_at ON job_runs (started_at);
CREATE INDEX IF NOT EXISTS idx_job_runs_status ON job_runs (status);
