use chrono::{DateTime, Utc};
use sqlx::SqlitePool;
use uuid::Uuid;

use super::models::{
    App, AppStats, CreateAppInput, CreateJobInput, DashboardStats, Job, JobRun, JobWithApp,
    RunResult, RunWithJobAndApp, UpdateAppInput, UpdateJobInput, User,
};

// ──── USER QUERIES ────

pub async fn create_user(
    pool: &SqlitePool,
    id: Uuid,
    username: &str,
    password_hash: &str,
) -> Result<User, sqlx::Error> {
    sqlx::query_as::<_, User>(
        "INSERT INTO users (id, username, password_hash)
         VALUES (?, ?, ?)
         RETURNING *",
    )
    .bind(id.to_string())
    .bind(username)
    .bind(password_hash)
    .fetch_one(pool)
    .await
}

pub async fn get_user_by_username(pool: &SqlitePool, username: &str) -> Result<User, sqlx::Error> {
    sqlx::query_as::<_, User>("SELECT * FROM users WHERE username = ?")
        .bind(username)
        .fetch_one(pool)
        .await
}

pub async fn get_user_by_id(pool: &SqlitePool, id: &str) -> Result<User, sqlx::Error> {
    sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = ?")
        .bind(id)
        .fetch_one(pool)
        .await
}

// ──── APP QUERIES (scoped by user_id) ────

pub async fn list_apps(pool: &SqlitePool, user_id: &str) -> Result<Vec<App>, sqlx::Error> {
    sqlx::query_as::<_, App>(
        "SELECT * FROM apps WHERE user_id = ? ORDER BY created_at DESC",
    )
    .bind(user_id)
    .fetch_all(pool)
    .await
}

pub async fn get_app(pool: &SqlitePool, id: String, user_id: &str) -> Result<App, sqlx::Error> {
    sqlx::query_as::<_, App>("SELECT * FROM apps WHERE id = ? AND user_id = ?")
        .bind(id)
        .bind(user_id)
        .fetch_one(pool)
        .await
}

pub async fn create_app(
    pool: &SqlitePool,
    id: Uuid,
    user_id: &str,
    input: &CreateAppInput,
) -> Result<App, sqlx::Error> {
    let description = input.description.clone().unwrap_or_default();
    sqlx::query_as::<_, App>(
        "INSERT INTO apps (id, user_id, name, base_url, description)
         VALUES (?, ?, ?, ?, ?)
         RETURNING *",
    )
    .bind(id.to_string())
    .bind(user_id)
    .bind(&input.name)
    .bind(&input.base_url)
    .bind(&description)
    .fetch_one(pool)
    .await
}

pub async fn update_app(
    pool: &SqlitePool,
    id: String,
    user_id: &str,
    input: &UpdateAppInput,
) -> Result<App, sqlx::Error> {
    sqlx::query_as::<_, App>(
        "UPDATE apps SET
            name = COALESCE(?, name),
            base_url = COALESCE(?, base_url),
            description = COALESCE(?, description)
         WHERE id = ? AND user_id = ?
         RETURNING *",
    )
    .bind(&input.name)
    .bind(&input.base_url)
    .bind(&input.description)
    .bind(&id)
    .bind(user_id)
    .fetch_one(pool)
    .await
}

pub async fn delete_app(pool: &SqlitePool, id: String, user_id: &str) -> Result<(), sqlx::Error> {
    let result = sqlx::query("DELETE FROM apps WHERE id = ? AND user_id = ?")
        .bind(id)
        .bind(user_id)
        .execute(pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(sqlx::Error::RowNotFound);
    }
    Ok(())
}

pub async fn app_stats(pool: &SqlitePool, user_id: &str) -> Result<Vec<AppStats>, sqlx::Error> {
    sqlx::query_as::<_, AppStats>(
        "SELECT
            a.id as app_id,
            (SELECT count(*) FROM jobs WHERE app_id = a.id) as job_count,
            (SELECT count(*) FROM jobs WHERE app_id = a.id AND enabled = true) as enabled_count,
            (SELECT MAX(j.last_run_at) FROM jobs j WHERE j.app_id = a.id) as last_run
         FROM apps a
         WHERE a.user_id = ?
         ORDER BY a.created_at DESC",
    )
    .bind(user_id)
    .fetch_all(pool)
    .await
}

// ──── JOB QUERIES ────

pub async fn list_jobs_for_app(pool: &SqlitePool, app_id: String) -> Result<Vec<Job>, sqlx::Error> {
    sqlx::query_as::<_, Job>(
        "SELECT * FROM jobs WHERE app_id = ? ORDER BY created_at DESC",
    )
    .bind(app_id)
    .fetch_all(pool)
    .await
}

pub async fn list_all_jobs_with_app(
    pool: &SqlitePool,
    user_id: &str,
) -> Result<Vec<JobWithApp>, sqlx::Error> {
    sqlx::query_as::<_, JobWithApp>(
        "SELECT j.*, a.name as app_name, a.base_url as app_base_url
         FROM jobs j
         JOIN apps a ON a.id = j.app_id
         WHERE a.user_id = ?
         ORDER BY j.created_at DESC",
    )
    .bind(user_id)
    .fetch_all(pool)
    .await
}

pub async fn get_job(pool: &SqlitePool, id: String) -> Result<Job, sqlx::Error> {
    sqlx::query_as::<_, Job>("SELECT * FROM jobs WHERE id = ?")
        .bind(id)
        .fetch_one(pool)
        .await
}

pub async fn get_job_with_app(
    pool: &SqlitePool,
    id: String,
    user_id: &str,
) -> Result<JobWithApp, sqlx::Error> {
    sqlx::query_as::<_, JobWithApp>(
        "SELECT j.*, a.name as app_name, a.base_url as app_base_url
         FROM jobs j
         JOIN apps a ON a.id = j.app_id
         WHERE j.id = ? AND a.user_id = ?",
    )
    .bind(id)
    .bind(user_id)
    .fetch_one(pool)
    .await
}

pub async fn create_job(
    pool: &SqlitePool,
    id: Uuid,
    app_id: String,
    input: &CreateJobInput,
    next_run_at: Option<DateTime<Utc>>,
) -> Result<Job, sqlx::Error> {
    let path = input.path.clone().unwrap_or_else(|| "/".into());
    let method = input.method.clone().unwrap_or_else(|| "GET".into());
    let headers = input
        .headers
        .clone()
        .unwrap_or(serde_json::Value::Object(Default::default()));
    let headers_str = serde_json::to_string(&headers).unwrap_or_else(|_| "{}".into());
    let description = input.description.clone().unwrap_or_default();
    let timeout = input.timeout_seconds.unwrap_or(30);
    let retries = input.retry_count.unwrap_or(0);
    let enabled = input.enabled.unwrap_or(true);
    let next_str = next_run_at.map(|d| d.to_rfc3339());

    sqlx::query_as::<_, Job>(
        "INSERT INTO jobs (id, app_id, name, description, cron_expression, path, method, headers, body, timeout_seconds, retry_count, enabled, next_run_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING *",
    )
    .bind(id.to_string())
    .bind(&app_id)
    .bind(&input.name)
    .bind(&description)
    .bind(&input.cron_expression)
    .bind(&path)
    .bind(&method)
    .bind(&headers_str)
    .bind(&input.body)
    .bind(timeout)
    .bind(retries)
    .bind(enabled)
    .bind(&next_str)
    .fetch_one(pool)
    .await
}

pub async fn update_job(
    pool: &SqlitePool,
    id: String,
    input: &UpdateJobInput,
    next_run_at: Option<DateTime<Utc>>,
) -> Result<Job, sqlx::Error> {
    let headers_str = input
        .headers
        .as_ref()
        .map(|h| serde_json::to_string(h).unwrap_or_else(|_| "{}".into()));
    let next_str = next_run_at.map(|d| d.to_rfc3339());

    sqlx::query_as::<_, Job>(
        "UPDATE jobs SET
            name = COALESCE(?, name),
            description = COALESCE(?, description),
            cron_expression = COALESCE(?, cron_expression),
            path = COALESCE(?, path),
            method = COALESCE(?, method),
            headers = COALESCE(?, headers),
            body = COALESCE(?, body),
            timeout_seconds = COALESCE(?, timeout_seconds),
            retry_count = COALESCE(?, retry_count),
            enabled = COALESCE(?, enabled),
            next_run_at = CASE WHEN ? IS NOT NULL THEN ? ELSE next_run_at END
         WHERE id = ?
         RETURNING *",
    )
    .bind(&input.name)
    .bind(&input.description)
    .bind(&input.cron_expression)
    .bind(&input.path)
    .bind(&input.method)
    .bind(&headers_str)
    .bind(&input.body)
    .bind(input.timeout_seconds)
    .bind(input.retry_count)
    .bind(input.enabled)
    .bind(&next_str)
    .bind(&next_str)
    .bind(id)
    .fetch_one(pool)
    .await
}

pub async fn delete_job(pool: &SqlitePool, id: String) -> Result<(), sqlx::Error> {
    let result = sqlx::query("DELETE FROM jobs WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(sqlx::Error::RowNotFound);
    }
    Ok(())
}

pub async fn get_due_jobs(pool: &SqlitePool, limit: i64) -> Result<Vec<JobWithApp>, sqlx::Error> {
    let now = Utc::now().to_rfc3339();
    sqlx::query_as::<_, JobWithApp>(
        "SELECT j.*, a.name as app_name, a.base_url as app_base_url
         FROM jobs j
         JOIN apps a ON a.id = j.app_id
         WHERE j.enabled = true AND j.next_run_at IS NOT NULL AND j.next_run_at <= ?
         ORDER BY j.next_run_at ASC
         LIMIT ?",
    )
    .bind(now)
    .bind(limit)
    .fetch_all(pool)
    .await
}

pub async fn update_job_timestamps(
    pool: &SqlitePool,
    id: String,
    status: &str,
    next_run_at: Option<DateTime<Utc>>,
) -> Result<(), sqlx::Error> {
    let now = Utc::now().to_rfc3339();
    let next_str = next_run_at.map(|d| d.to_rfc3339());
    sqlx::query(
        "UPDATE jobs SET
            last_run_at = ?,
            last_run_status = ?,
            next_run_at = COALESCE(?, next_run_at)
         WHERE id = ?",
    )
    .bind(now)
    .bind(status)
    .bind(&next_str)
    .bind(id)
    .execute(pool)
    .await?;
    Ok(())
}

// ──── RUN QUERIES ────

pub async fn list_runs_for_job(
    pool: &SqlitePool,
    job_id: String,
    limit: i64,
    offset: i64,
) -> Result<Vec<JobRun>, sqlx::Error> {
    sqlx::query_as::<_, JobRun>(
        "SELECT * FROM job_runs WHERE job_id = ? ORDER BY started_at DESC LIMIT ? OFFSET ?",
    )
    .bind(job_id)
    .bind(limit)
    .bind(offset)
    .fetch_all(pool)
    .await
}

pub async fn list_all_runs(
    pool: &SqlitePool,
    user_id: &str,
    limit: i64,
    offset: i64,
    status_filter: Option<&str>,
) -> Result<Vec<RunWithJobAndApp>, sqlx::Error> {
    if let Some(status) = status_filter {
        sqlx::query_as::<_, RunWithJobAndApp>(
            "SELECT r.*, j.name as job_name, a.name as app_name, a.base_url as app_base_url
             FROM job_runs r
             JOIN jobs j ON j.id = r.job_id
             JOIN apps a ON a.id = j.app_id
             WHERE a.user_id = ? AND r.status = ?
             ORDER BY r.started_at DESC LIMIT ? OFFSET ?",
        )
        .bind(user_id)
        .bind(status)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await
    } else {
        sqlx::query_as::<_, RunWithJobAndApp>(
            "SELECT r.*, j.name as job_name, a.name as app_name, a.base_url as app_base_url
             FROM job_runs r
             JOIN jobs j ON j.id = r.job_id
             JOIN apps a ON a.id = j.app_id
             WHERE a.user_id = ?
             ORDER BY r.started_at DESC LIMIT ? OFFSET ?",
        )
        .bind(user_id)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await
    }
}

pub async fn create_run(
    pool: &SqlitePool,
    run_id: Uuid,
    job_id: String,
    attempt: i32,
    method: &str,
    url: &str,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO job_runs (id, job_id, status, attempt_number, request_method, request_url, started_at)
         VALUES (?, ?, 'running', ?, ?, ?, datetime('now'))",
    )
    .bind(run_id.to_string())
    .bind(job_id)
    .bind(attempt)
    .bind(method)
    .bind(url)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn complete_run(
    pool: &SqlitePool,
    run_id: Uuid,
    result: &RunResult,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        "UPDATE job_runs SET
            status = ?,
            status_code = ?,
            response_body = ?,
            duration_ms = ?,
            error_message = ?,
            finished_at = datetime('now')
         WHERE id = ?",
    )
    .bind(&result.status)
    .bind(result.status_code)
    .bind(&result.response_body)
    .bind(result.duration_ms)
    .bind(&result.error_message)
    .bind(run_id.to_string())
    .execute(pool)
    .await?;
    Ok(())
}

// ──── STATS ────

pub async fn get_dashboard_stats(
    pool: &SqlitePool,
    user_id: &str,
) -> Result<DashboardStats, sqlx::Error> {
    let now = Utc::now().to_rfc3339();
    let today_start = Utc::now()
        .date_naive()
        .and_hms_opt(0, 0, 0)
        .unwrap()
        .and_local_timezone(Utc)
        .unwrap()
        .to_rfc3339();
    let one_hour_ago = Utc::now()
        .checked_sub_signed(chrono::Duration::hours(1))
        .unwrap_or_else(Utc::now)
        .to_rfc3339();

    let total_apps: i64 =
        sqlx::query_scalar("SELECT count(*) FROM apps WHERE user_id = ?")
            .bind(user_id)
            .fetch_one(pool)
            .await?;
    let total_jobs: i64 = sqlx::query_scalar(
        "SELECT count(*) FROM jobs j JOIN apps a ON a.id = j.app_id WHERE a.user_id = ?",
    )
    .bind(user_id)
    .fetch_one(pool)
    .await?;
    let enabled_jobs: i64 = sqlx::query_scalar(
        "SELECT count(*) FROM jobs j JOIN apps a ON a.id = j.app_id WHERE a.user_id = ? AND j.enabled = true",
    )
    .bind(user_id)
    .fetch_one(pool)
    .await?;
    let due_jobs: i64 = sqlx::query_scalar(
        "SELECT count(*) FROM jobs j JOIN apps a ON a.id = j.app_id
         WHERE a.user_id = ? AND j.enabled = true AND j.next_run_at IS NOT NULL AND j.next_run_at <= ?",
    )
    .bind(user_id)
    .bind(&now)
    .fetch_one(pool)
    .await?;
    let recent_failures: i64 = sqlx::query_scalar(
        "SELECT count(*) FROM job_runs r
         JOIN jobs j ON j.id = r.job_id
         JOIN apps a ON a.id = j.app_id
         WHERE a.user_id = ? AND r.status IN ('failed', 'timeout') AND r.started_at > ?",
    )
    .bind(user_id)
    .bind(&one_hour_ago)
    .fetch_one(pool)
    .await?;
    let runs_today: i64 = sqlx::query_scalar(
        "SELECT count(*) FROM job_runs r
         JOIN jobs j ON j.id = r.job_id
         JOIN apps a ON a.id = j.app_id
         WHERE a.user_id = ? AND r.started_at >= ?",
    )
    .bind(user_id)
    .bind(&today_start)
    .fetch_one(pool)
    .await?;

    Ok(DashboardStats {
        total_apps,
        total_jobs,
        enabled_jobs,
        due_jobs,
        recent_failures,
        runs_today,
    })
}
