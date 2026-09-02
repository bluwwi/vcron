use axum::extract::{Path, Query, State};
use axum::http::StatusCode;
use axum::routing::get;
use axum::{Json, Router};
use chrono::Utc;
use uuid::Uuid;

use crate::db::models::{
    CreateJobInput, Job, JobListParams, JobRun, PaginatedResult, UpdateJobInput,
};
use crate::db::queries;
use crate::error::{AppError, AppResult};
use crate::util::{calculate_next_run, validate_cron_expression};
use crate::AppState;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/api/jobs", get(list).post(create))
        .route(
            "/api/jobs/{id}",
            get(get_one).put(update).delete(delete),
        )
        .route("/api/jobs/{id}/runs", get(list_runs))
        .route("/api/stats", get(stats))
}

async fn list(
    State(state): State<AppState>,
    Query(params): Query<JobListParams>,
) -> AppResult<Json<PaginatedResult<Job>>> {
    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(20).clamp(1, 100);
    let enabled_only = params.enabled_only.unwrap_or(false);

    let result = queries::list_jobs_paginated(&state.db, page, per_page, enabled_only)
        .await
        .map_err(AppError::Database)?;
    Ok(Json(result))
}

async fn create(
    State(state): State<AppState>,
    Json(input): Json<CreateJobInput>,
) -> AppResult<(StatusCode, Json<Job>)> {
    validate_job_input(&input.name, &input.cron_expression, &input.url, input.method.as_deref())?;

    let id = Uuid::new_v4();
    let next_run = calculate_next_run(&input.cron_expression, Utc::now())
        .map_err(AppError::Validation)?;

    let job = queries::create_job(&state.db, id, &input, Some(next_run))
        .await
        .map_err(AppError::Database)?;
    Ok((StatusCode::CREATED, Json(job)))
}

async fn get_one(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> AppResult<Json<Job>> {
    let job = queries::get_job(&state.db, id)
        .await
        .map_err(AppError::Database)?;
    Ok(Json(job))
}

async fn update(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(input): Json<UpdateJobInput>,
) -> AppResult<Json<Job>> {
    if let Some(ref expr) = input.cron_expression {
        validate_cron_expression(expr).map_err(AppError::Validation)?;
    }
    if let Some(ref method) = input.method {
        validate_method(method)?;
    }
    if let Some(ref name) = input.name {
        if name.trim().is_empty() {
            return Err(AppError::Validation("name cannot be empty".into()));
        }
    }
    if let Some(ref url) = input.url {
        validate_url(url)?;
    }

    let next_run = if let Some(ref expr) = input.cron_expression {
        Some(calculate_next_run(expr, Utc::now()).map_err(AppError::Validation)?)
    } else {
        None
    };

    let job = queries::update_job(&state.db, id, &input, next_run)
        .await
        .map_err(AppError::Database)?;
    Ok(Json(job))
}

async fn delete(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> AppResult<StatusCode> {
    queries::delete_job(&state.db, id)
        .await
        .map_err(AppError::Database)?;
    Ok(StatusCode::NO_CONTENT)
}

async fn list_runs(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Query(params): Query<JobListParams>,
) -> AppResult<Json<Vec<JobRun>>> {
    let per_page = params.per_page.unwrap_or(20).clamp(1, 100);
    let page = params.page.unwrap_or(1).max(1);
    let offset = (page - 1) * per_page;

    let runs = queries::list_runs_for_job(&state.db, id, per_page, offset)
        .await
        .map_err(AppError::Database)?;
    Ok(Json(runs))
}

async fn stats(
    State(state): State<AppState>,
) -> AppResult<Json<crate::db::models::DashboardStats>> {
    let stats = queries::get_dashboard_stats(&state.db)
        .await
        .map_err(AppError::Database)?;
    Ok(Json(stats))
}

fn validate_job_input(
    name: &str,
    cron_expr: &str,
    url: &str,
    method: Option<&str>,
) -> AppResult<()> {
    if name.trim().is_empty() {
        return Err(AppError::Validation("name cannot be empty".into()));
    }
    validate_cron_expression(cron_expr).map_err(AppError::Validation)?;
    validate_url(url)?;
    if let Some(m) = method {
        validate_method(m)?;
    }
    Ok(())
}

fn validate_url(url: &str) -> AppResult<()> {
    if url.trim().is_empty() {
        return Err(AppError::Validation("url cannot be empty".into()));
    }
    if !url.starts_with("http://") && !url.starts_with("https://") {
        return Err(AppError::Validation("url must start with http:// or https://".into()));
    }
    Ok(())
}

fn validate_method(method: &str) -> AppResult<()> {
    match method {
        "GET" | "POST" | "PUT" | "DELETE" | "PATCH" => Ok(()),
        _ => Err(AppError::Validation(format!(
            "method must be one of GET, POST, PUT, DELETE, PATCH (got {method})"
        ))),
    }
}
