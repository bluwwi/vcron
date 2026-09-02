use axum::extract::{Request, State};
use axum::http::StatusCode;
use axum::middleware::Next;
use axum::response::Response;
use axum::Json;
use serde_json::json;

use crate::AppState;

pub async fn auth_middleware(
    State(state): State<AppState>,
    req: Request,
    next: Next,
) -> Result<Response, (StatusCode, Json<serde_json::Value>)> {
    let api_key = req
        .headers()
        .get("X-API-Key")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    match api_key {
        Some(key) if key == state.config.api_key => Ok(next.run(req).await),
        _ => Err((
            StatusCode::UNAUTHORIZED,
            Json(json!({ "error": "invalid or missing API key" })),
        )),
    }
}
