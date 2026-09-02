use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::routing::{get, post};
use axum::{Json, Router};
use uuid::Uuid;

use crate::db::models::{CreateAppInput, UpdateAppInput, App};
use crate::db::queries;
use crate::error::{AppError, AppResult};
use crate::AppState;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/api/apps", get(list).post(create))
        .route(
            "/api/apps/{id}",
            get(get_one).put(update).delete(delete),
        )
        .route("/api/apps/{id}/jobs", get(list_jobs))
        .route("/api/apps/stats", get(stats))
}

async fn list(State(state): State<AppState>) -> AppResult<Json<Vec<App>>> {
    let apps = queries::list_apps(&state.db).await.map_err(AppError::Database)?;
    Ok(Json(apps))
}

async fn get_one(State(state): State<AppState>, Path(id): Path<String>) -> AppResult<Json<App>> {
    let app = queries::get_app(&state.db, id).await.map_err(AppError::Database)?;
    Ok(Json(app))
}

async fn create(
    State(state): State<AppState>,
    Json(input): Json<CreateAppInput>,
) -> AppResult<(StatusCode, Json<App>)> {
    if input.name.trim().is_empty() {
        return Err(AppError::Validation("name cannot be empty".into()));
    }
    if !input.base_url.starts_with("http://") && !input.base_url.starts_with("https://") {
        return Err(AppError::Validation("base_url must start with http:// or https://".into()));
    }

    let id = Uuid::new_v4();
    let app = queries::create_app(&state.db, id, &input)
        .await
        .map_err(AppError::Database)?;
    Ok((StatusCode::CREATED, Json(app)))
}

async fn update(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(input): Json<UpdateAppInput>,
) -> AppResult<Json<App>> {
    if let Some(ref name) = input.name {
        if name.trim().is_empty() {
            return Err(AppError::Validation("name cannot be empty".into()));
        }
    }
    if let Some(ref url) = input.base_url {
        if !url.starts_with("http://") && !url.starts_with("https://") {
            return Err(AppError::Validation("base_url must start with http:// or https://".into()));
        }
    }

    let app = queries::update_app(&state.db, id, &input)
        .await
        .map_err(AppError::Database)?;
    Ok(Json(app))
}

async fn delete(State(state): State<AppState>, Path(id): Path<String>) -> AppResult<StatusCode> {
    queries::delete_app(&state.db, id).await.map_err(AppError::Database)?;
    Ok(StatusCode::NO_CONTENT)
}

async fn list_jobs(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> AppResult<Json<Vec<crate::db::models::Job>>> {
    let jobs = queries::list_jobs_for_app(&state.db, id)
        .await
        .map_err(AppError::Database)?;
    Ok(Json(jobs))
}

async fn stats(State(state): State<AppState>) -> AppResult<Json<Vec<crate::db::models::AppStats>>> {
    let s = queries::app_stats(&state.db).await.map_err(AppError::Database)?;
    Ok(Json(s))
}
