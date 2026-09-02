mod api;
mod config;
mod db;
mod error;
mod executor;
mod scheduler;
mod util;

use std::time::Duration;

use axum::Router;
use sqlx::sqlite::SqlitePoolOptions;
use sqlx::SqlitePool;
use tower_http::limit::RequestBodyLimitLayer;
use tower_http::timeout::TimeoutLayer;
use tower_http::trace::TraceLayer;

use crate::config::Config;

#[derive(Clone)]
pub struct AppState {
    pub db: SqlitePool,
    pub config: Config,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let config = Config::from_env();

    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "revoCron=info,tower_http=info".into()),
        )
        .init();

    if let Some(path) = config
        .database_url
        .strip_prefix("sqlite:")
        .and_then(|s| s.split('?').next())
    {
        let p = std::path::Path::new(path);
        if let Some(parent) = p.parent() {
            if !parent.as_os_str().is_empty() {
                std::fs::create_dir_all(parent).ok();
            }
        }
    }

    let pool = SqlitePoolOptions::new()
        .max_connections(3)
        .connect(&config.database_url)
        .await?;

    sqlx::migrate!("./migrations").run(&pool).await?;
    tracing::info!("database connected and migrated");

    let state = AppState {
        db: pool.clone(),
        config: config.clone(),
    };

    let scheduler_state = state.clone();
    tokio::spawn(async move {
        scheduler::engine::run(scheduler_state).await;
    });

    let app = build_app(state);

    let addr = format!("0.0.0.0:{}", config.port);
    tracing::info!("revoCron listening on {addr}");

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    Ok(())
}

fn build_app(state: AppState) -> Router {
    Router::new()
        .merge(api::health::routes())
        .merge(api::build_api_router(state.clone()))
        .layer(TraceLayer::new_for_http())
        .layer(TimeoutLayer::new(Duration::from_secs(30)))
        .layer(RequestBodyLimitLayer::new(1024 * 1024))
        .with_state(state)
}

async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }

    tracing::info!("shutdown signal received");
}
