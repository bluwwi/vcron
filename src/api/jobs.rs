use axum::extract::{Path, Query, State};
use axum::http::StatusCode;
use axum::routing::get;
use axum::{Extension, Json, Router};
use chrono::Utc;
use uuid::Uuid;

use crate::api::auth::Claims;
use crate::db::models::{
    CreateJobInput, Job, JobRun, JobWithApp, ListParams, RunWithJobAndApp, UpdateJobInput,
};
use crate::db::queries;
use crate::error::{AppError, AppResult};
use crate::util::{calculate_next_run, validate_cron_expression};
use crate::AppState;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/api/jobs", get(list_all).post(create))
        .route("/api/jobs/{id}", get(get_one).put(update).delete(delete))
        .route("/api/jobs/{id}/runs", get(list_runs))
        .route("/api/runs", get(list_all_runs))
        .route("/api/stats", get(stats))
}

async fn list_all(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
) -> AppResult<Json<Vec<JobWithApp>>> {
    let jobs = queries::list_all_jobs_with_app(&state.db, &claims.sub)
        .await
        .map_err(AppError::Database)?;
    Ok(Json(jobs))
}

async fn get_one(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Extension(claims): Extension<Claims>,
) -> AppResult<Json<JobWithApp>> {
    let job = queries::get_job_with_app(&state.db, id, &claims.sub)
        .await
        .map_err(AppError::Database)?;
    Ok(Json(job))
}

async fn create(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Json(input): Json<CreateJobInput>,
) -> AppResult<(StatusCode, Json<Job>)> {
    validate_job_input(&input.name, &input.cron_expression, input.method.as_deref())?;

    queries::get_app(&state.db, input.app_id.clone(), &claims.sub)
        .await
        .map_err(AppError::Database)?;

    let id = Uuid::new_v4();
    let next_run = calculate_next_run(&input.cron_expression, Utc::now())
        .map_err(AppError::Validation)?;

    let job = queries::create_job(&state.db, id, input.app_id.clone(), &input, Some(next_run))
        .await
        .map_err(AppError::Database)?;
    Ok((StatusCode::CREATED, Json(job)))
}

async fn update(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Extension(claims): Extension<Claims>,
    Json(input): Json<UpdateJobInput>,
) -> AppResult<Json<Job>> {
    queries::get_job_with_app(&state.db, id.clone(), &claims.sub)
        .await
        .map_err(AppError::Database)?;

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

    let next_run = if let Some(ref expr) = input.cron_expression {
        Some(calculate_next_run(expr, Utc::now()).map_err(AppError::Validation)?)
    } else {
        None
    };

    let updated = queries::update_job(&state.db, id, &input, next_run)
        .await
        .map_err(AppError::Database)?;
    Ok(Json(updated))
}

async fn delete(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Extension(claims): Extension<Claims>,
) -> AppResult<StatusCode> {
    queries::get_job_with_app(&state.db, id.clone(), &claims.sub)
        .await
        .map_err(AppError::Database)?;
    queries::delete_job(&state.db, id)
        .await
        .map_err(AppError::Database)?;
    Ok(StatusCode::NO_CONTENT)
}

async fn list_runs(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Extension(claims): Extension<Claims>,
    Query(params): Query<ListParams>,
) -> AppResult<Json<Vec<JobRun>>> {
    queries::get_job_with_app(&state.db, id.clone(), &claims.sub)
        .await
        .map_err(AppError::Database)?;

    let per_page = params.per_page.unwrap_or(50).clamp(1, 200);
    let page = params.page.unwrap_or(1).max(1);
    let offset = (page - 1) * per_page;

    let runs = queries::list_runs_for_job(&state.db, id, per_page, offset)
        .await
        .map_err(AppError::Database)?;
    Ok(Json(runs))
}

#[derive(Debug, serde::Deserialize)]
struct RunListParams {
    #[serde(default)]
    page: Option<i64>,
    #[serde(default)]
    per_page: Option<i64>,
    #[serde(default)]
    status: Option<String>,
}

async fn list_all_runs(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Query(params): Query<RunListParams>,
) -> AppResult<Json<Vec<RunWithJobAndApp>>> {
    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(50).clamp(1, 200);
    let offset = (page - 1) * per_page;
    let status_filter = params.status.as_deref().filter(|s| !s.is_empty());

    let runs = queries::list_all_runs(&state.db, &claims.sub, per_page, offset, status_filter)
        .await
        .map_err(AppError::Database)?;
    Ok(Json(runs))
}

async fn stats(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
) -> AppResult<Json<crate::db::models::DashboardStats>> {
    let stats = queries::get_dashboard_stats(&state.db, &claims.sub)
        .await
        .map_err(AppError::Database)?;
    Ok(Json(stats))
}

fn validate_job_input(name: &str, cron_expr: &str, method: Option<&str>) -> AppResult<()> {
    if name.trim().is_empty() {
        return Err(AppError::Validation("name cannot be empty".into()));
    }
    validate_cron_expression(cron_expr).map_err(AppError::Validation)?;
    if let Some(m) = method {
        validate_method(m)?;
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
