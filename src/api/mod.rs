pub mod apps;
pub mod health;
pub mod jobs;

use axum::Router;

use crate::AppState;

pub fn build_api_router() -> Router<AppState> {
    Router::new()
        .merge(health::routes())
        .merge(apps::routes())
        .merge(jobs::routes())
}
