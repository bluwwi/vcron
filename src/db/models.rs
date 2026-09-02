use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct App {
    pub id: String,
    pub name: String,
    pub base_url: String,
    pub description: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateAppInput {
    pub name: String,
    pub base_url: String,
    #[serde(default)]
    pub description: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateAppInput {
    #[serde(default)]
    pub name: Option<String>,
    #[serde(default)]
    pub base_url: Option<String>,
    #[serde(default)]
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Job {
    pub id: String,
    pub app_id: String,
    pub name: String,
    pub description: String,
    pub cron_expression: String,
    pub path: String,
    pub method: String,
    pub headers: serde_json::Value,
    pub body: Option<String>,
    pub timeout_seconds: i32,
    pub retry_count: i32,
    pub enabled: bool,
    pub last_run_at: Option<DateTime<Utc>>,
    pub last_run_status: Option<String>,
    pub next_run_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct JobWithApp {
    pub id: String,
    pub app_id: String,
    pub app_name: String,
    pub app_base_url: String,
    pub name: String,
    pub description: String,
    pub cron_expression: String,
    pub path: String,
    pub method: String,
    pub headers: serde_json::Value,
    pub body: Option<String>,
    pub timeout_seconds: i32,
    pub retry_count: i32,
    pub enabled: bool,
    pub last_run_at: Option<DateTime<Utc>>,
    pub last_run_status: Option<String>,
    pub next_run_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct JobRun {
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
}

#[derive(Debug, Serialize, FromRow)]
pub struct RunWithJobAndApp {
    pub id: String,
    pub job_id: String,
    pub job_name: String,
    pub app_name: String,
    pub app_base_url: String,
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
}

#[derive(Debug, Deserialize)]
pub struct CreateJobInput {
    pub app_id: String,
    pub name: String,
    #[serde(default)]
    pub description: Option<String>,
    pub cron_expression: String,
    #[serde(default)]
    pub path: Option<String>,
    #[serde(default)]
    pub method: Option<String>,
    #[serde(default)]
    pub headers: Option<serde_json::Value>,
    #[serde(default)]
    pub body: Option<String>,
    #[serde(default)]
    pub timeout_seconds: Option<i32>,
    #[serde(default)]
    pub retry_count: Option<i32>,
    #[serde(default)]
    pub enabled: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateJobInput {
    #[serde(default)]
    pub name: Option<String>,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub cron_expression: Option<String>,
    #[serde(default)]
    pub path: Option<String>,
    #[serde(default)]
    pub method: Option<String>,
    #[serde(default)]
    pub headers: Option<serde_json::Value>,
    #[serde(default)]
    pub body: Option<String>,
    #[serde(default)]
    pub timeout_seconds: Option<i32>,
    #[serde(default)]
    pub retry_count: Option<i32>,
    #[serde(default)]
    pub enabled: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct ListParams {
    #[serde(default)]
    pub page: Option<i64>,
    #[serde(default)]
    pub per_page: Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct PaginatedResult<T> {
    pub items: Vec<T>,
    pub total: i64,
    pub page: i64,
    pub per_page: i64,
    pub total_pages: i64,
}

#[derive(Debug, Serialize, FromRow)]
pub struct DashboardStats {
    pub total_apps: i64,
    pub total_jobs: i64,
    pub enabled_jobs: i64,
    pub due_jobs: i64,
    pub recent_failures: i64,
    pub runs_today: i64,
}

#[derive(Debug, Serialize, FromRow)]
pub struct AppStats {
    pub app_id: String,
    pub job_count: i64,
    pub enabled_count: i64,
    pub last_run: Option<String>,
}

#[derive(Debug)]
pub struct RunResult {
    pub status: String,
    pub status_code: Option<i32>,
    pub response_body: Option<String>,
    pub duration_ms: i32,
    pub error_message: Option<String>,
}
