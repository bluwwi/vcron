use chrono::{DateTime, Utc};
use sqlx::SqlitePool;
use uuid::Uuid;

use super::models::{
    CreateJobInput, DashboardStats, Job, JobRun, PaginatedResult, RunResult, UpdateJobInput,
};

pub async fn list_jobs(
    pool: &SqlitePool,
    enabled_only: bool,
    limit: i64,
    offset: i64,
) -> Result<Vec<Job>, sqlx::Error> {
    if enabled_only {
        sqlx::query_as::<_, Job>(
            "SELECT * FROM jobs WHERE enabled = true ORDER BY created_at DESC LIMIT ? OFFSET ?",
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await
    } else {
        sqlx::query_as::<_, Job>(
            "SELECT * FROM jobs ORDER BY created_at DESC LIMIT ? OFFSET ?",
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await
    }
}

pub async fn count_jobs(pool: &SqlitePool, enabled_only: bool) -> Result<i64, sqlx::Error> {
    if enabled_only {
        sqlx::query_scalar("SELECT count(*) FROM jobs WHERE enabled = true")
            .fetch_one(pool)
            .await
    } else {
        sqlx::query_scalar("SELECT count(*) FROM jobs")
            .fetch_one(pool)
            .await
    }
}

pub async fn get_job(pool: &SqlitePool, id: String) -> Result<Job, sqlx::Error> {
    sqlx::query_as::<_, Job>("SELECT * FROM jobs WHERE id = ?")
        .bind(id)
        .fetch_one(pool)
        .await
}

pub async fn create_job(
    pool: &SqlitePool,
    id: Uuid,
    input: &CreateJobInput,
    next_run_at: Option<DateTime<Utc>>,
) -> Result<Job, sqlx::Error> {
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
        "INSERT INTO jobs (id, name, description, cron_expression, url, method, headers, body, timeout_seconds, retry_count, enabled, next_run_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING *",
    )
    .bind(id.to_string())
    .bind(&input.name)
    .bind(&description)
    .bind(&input.cron_expression)
    .bind(&input.url)
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
            url = COALESCE(?, url),
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
    .bind(&input.url)
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

pub async fn get_due_jobs(pool: &SqlitePool, limit: i64) -> Result<Vec<Job>, sqlx::Error> {
    let now = Utc::now().to_rfc3339();
    sqlx::query_as::<_, Job>(
        "SELECT * FROM jobs
         WHERE enabled = true AND next_run_at IS NOT NULL AND next_run_at <= ?
         ORDER BY next_run_at ASC
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

#[derive(Debug, Clone, serde::Serialize, sqlx::FromRow)]
pub struct RunWithJobName {
    pub id: String,
    pub job_id: String,
    pub status: String,
    pub status_code: Option<i32>,
    pub response_body: Option<String>,
    pub request_method: Option<String>,
    pub request_url: Option<String>,
    pub duration_ms: Option<i32>,
    pub error_message: Option<String>,
    pub attempt_number: i32,
    pub started_at: DateTime<Utc>,
    pub finished_at: Option<DateTime<Utc>>,
    pub job_name: String,
}

pub async fn list_all_runs(
    pool: &SqlitePool,
    limit: i64,
    offset: i64,
    status_filter: Option<&str>,
) -> Result<Vec<RunWithJobName>, sqlx::Error> {
    if let Some(status) = status_filter {
        sqlx::query_as::<_, RunWithJobName>(
            "SELECT r.*, j.name as job_name FROM job_runs r
             JOIN jobs j ON j.id = r.job_id
             WHERE r.status = ?
             ORDER BY r.started_at DESC LIMIT ? OFFSET ?",
        )
        .bind(status)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await
    } else {
        sqlx::query_as::<_, RunWithJobName>(
            "SELECT r.*, j.name as job_name FROM job_runs r
             JOIN jobs j ON j.id = r.job_id
             ORDER BY r.started_at DESC LIMIT ? OFFSET ?",
        )
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

#[allow(dead_code)]
pub async fn prune_old_runs(pool: &SqlitePool, retention_days: i64) -> Result<u64, sqlx::Error> {
    let cutoff = Utc::now()
        .checked_sub_signed(chrono::Duration::days(retention_days))
        .unwrap_or_else(Utc::now)
        .to_rfc3339();
    let result = sqlx::query("DELETE FROM job_runs WHERE started_at < ?")
        .bind(cutoff)
        .execute(pool)
        .await?;
    Ok(result.rows_affected())
}

pub async fn get_dashboard_stats(pool: &SqlitePool) -> Result<DashboardStats, sqlx::Error> {
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

    let total_jobs: i64 = sqlx::query_scalar("SELECT count(*) FROM jobs")
        .fetch_one(pool)
        .await?;
    let enabled_jobs: i64 =
        sqlx::query_scalar("SELECT count(*) FROM jobs WHERE enabled = true")
            .fetch_one(pool)
            .await?;
    let due_jobs: i64 = sqlx::query_scalar(
        "SELECT count(*) FROM jobs WHERE enabled = true AND next_run_at IS NOT NULL AND next_run_at <= ?",
    )
    .bind(&now)
    .fetch_one(pool)
    .await?;
    let recent_failures: i64 = sqlx::query_scalar(
        "SELECT count(*) FROM job_runs WHERE status IN ('failed', 'timeout') AND started_at > ?",
    )
    .bind(&one_hour_ago)
    .fetch_one(pool)
    .await?;
    let runs_today: i64 =
        sqlx::query_scalar("SELECT count(*) FROM job_runs WHERE started_at >= ?")
            .bind(&today_start)
            .fetch_one(pool)
            .await?;

    Ok(DashboardStats {
        total_jobs,
        enabled_jobs,
        due_jobs,
        recent_failures,
        runs_today,
    })
}

pub async fn list_jobs_paginated(
    pool: &SqlitePool,
    page: i64,
    per_page: i64,
    enabled_only: bool,
) -> Result<PaginatedResult<Job>, sqlx::Error> {
    let offset = (page - 1).max(0) * per_page;
    let total = count_jobs(pool, enabled_only).await?;
    let items = list_jobs(pool, enabled_only, per_page, offset).await?;
    let total_pages = if per_page > 0 {
        ((total as f64) / (per_page as f64)).ceil() as i64
    } else {
        1
    };
    Ok(PaginatedResult {
        items,
        total,
        page,
        per_page,
        total_pages: total_pages.max(1),
    })
}
