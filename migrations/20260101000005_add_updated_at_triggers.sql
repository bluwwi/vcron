CREATE TRIGGER IF NOT EXISTS update_apps_updated_at
    AFTER UPDATE ON apps
    FOR EACH ROW
    BEGIN
        UPDATE apps SET updated_at = datetime('now') WHERE id = OLD.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_jobs_updated_at
    AFTER UPDATE ON jobs
    FOR EACH ROW
    BEGIN
        UPDATE jobs SET updated_at = datetime('now') WHERE id = OLD.id;
    END;
