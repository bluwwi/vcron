pub mod apps;
pub mod auth;
pub mod health;
pub mod jobs;

use axum::middleware;
use axum::routing::{get, post};
use axum::Router;

use crate::AppState;

pub fn build_api_router(state: AppState) -> Router<AppState> {
    // Auth routes — no middleware (register, login, logout)
    let auth_routes = Router::new()
        .route("/api/auth/register", post(auth::register))
        .route("/api/auth/login", post(auth::login))
        .route("/api/auth/logout", post(auth::logout));

    // Public routes — no auth needed
    let public_routes = Router::new().merge(health::routes());

    // Protected routes — require JWT cookie
    let protected_routes = Router::new()
        .route("/api/auth/me", get(auth::me))
        .merge(apps::routes())
        .merge(jobs::routes())
        .route_layer(middleware::from_fn_with_state(
            state.clone(),
            auth::auth_middleware,
        ));

    Router::new()
        .merge(auth_routes)
        .merge(public_routes)
        .merge(protected_routes)
}
