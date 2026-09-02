use axum::routing::get;
use axum::{extract::State, Json, Router};
use serde_json::json;
use std::sync::LazyLock;
use std::time::Instant;

use crate::AppState;

static APP_START: LazyLock<Instant> = LazyLock::new(Instant::now);

pub fn routes() -> Router<AppState> {
    Router::new().route("/health", get(handler))
}

async fn handler(State(state): State<AppState>) -> Json<serde_json::Value> {
    let db_ok = sqlx::query_scalar::<_, i32>("SELECT 1")
        .fetch_one(&state.db)
        .await
        .is_ok();

    let (enabled, total) = if db_ok {
        let e: i64 = sqlx::query_scalar("SELECT count(*) FROM jobs WHERE enabled = true")
            .fetch_one(&state.db)
            .await
            .unwrap_or(0);
        let t: i64 = sqlx::query_scalar("SELECT count(*) FROM jobs")
            .fetch_one(&state.db)
            .await
            .unwrap_or(0);
        (e, t)
    } else {
        (0, 0)
    };

    Json(json!({
        "status": if db_ok { "healthy" } else { "degraded" },
        "version": env!("CARGO_PKG_VERSION"),
        "uptime_seconds": APP_START.elapsed().as_secs(),
        "database": {
            "connected": db_ok,
            "jobs_enabled": enabled,
            "jobs_total": total,
        }
    }))
}
