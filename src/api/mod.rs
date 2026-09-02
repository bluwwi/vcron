pub mod auth;
pub mod health;
pub mod jobs;

use axum::middleware;
use axum::Router;

use crate::AppState;

pub fn build_api_router(state: AppState) -> Router<AppState> {
    let job_routes = jobs::routes();
    let state_for_auth = state.clone();

    Router::new()
        .merge(job_routes)
        .route_layer(middleware::from_fn_with_state(
            state_for_auth,
            auth::auth_middleware,
        ))
}
