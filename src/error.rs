use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;
use serde_json::json;
use thiserror::Error;

pub type AppResult<T> = Result<T, AppError>;

#[derive(Error, Debug)]
#[allow(dead_code)]
pub enum AppError {
    #[error("not found: {0}")]
    NotFound(String),

    #[error("conflict: {0}")]
    Conflict(String),

    #[error("validation error: {0}")]
    Validation(String),

    #[error("unauthorized: {0}")]
    Unauthorized(String),

    #[error("database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("internal error: {0}")]
    Internal(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        match &self {
            AppError::NotFound(m) => (
                StatusCode::NOT_FOUND,
                Json(json!({ "error": m })),
            )
                .into_response(),
            AppError::Conflict(m) => (
                StatusCode::CONFLICT,
                Json(json!({ "error": m })),
            )
                .into_response(),
            AppError::Validation(m) => (
                StatusCode::UNPROCESSABLE_ENTITY,
                Json(json!({ "error": m })),
            )
                .into_response(),
            AppError::Unauthorized(m) => (
                StatusCode::UNAUTHORIZED,
                Json(json!({ "error": m })),
            )
                .into_response(),
            AppError::Internal(m) => {
                tracing::error!("Internal error: {m}");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({ "error": "internal error" })),
                )
                    .into_response()
            }
            AppError::Database(e) => map_db_error(e),
        }
    }
}

fn map_db_error(err: &sqlx::Error) -> Response {
    match err {
        sqlx::Error::RowNotFound => (
            StatusCode::NOT_FOUND,
            Json(json!({ "error": "resource not found" })),
        )
            .into_response(),
        sqlx::Error::Database(d) => {
            let msg = d.to_string();
            if msg.contains("UNIQUE") {
                (
                    StatusCode::CONFLICT,
                    Json(json!({ "error": "job name already exists" })),
                )
            } else {
                tracing::error!("DB error: {err}");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({ "error": "database error" })),
                )
            }
            .into_response()
        }
        _ => {
            tracing::error!("DB error: {err}");
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": "database error" })),
            )
                .into_response()
        }
    }
}
