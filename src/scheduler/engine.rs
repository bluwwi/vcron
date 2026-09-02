use chrono::Utc;
use std::time::Duration;
use tokio::time::interval;
use tracing::{error, info};

use crate::db::queries;
use crate::executor::http;
use crate::AppState;

pub async fn run(state: AppState) {
    let mut ticker = interval(Duration::from_secs(state.config.scheduler_interval_seconds));
    ticker.tick().await;

    info!(
        "scheduler started, checking every {}s",
        state.config.scheduler_interval_seconds
    );

    loop {
        ticker.tick().await;
        if let Err(e) = tick(&state).await {
            error!("scheduler tick failed: {e}");
        }
    }
}

async fn tick(state: &AppState) -> anyhow::Result<()> {
    let due = queries::get_due_jobs(&state.db, 50).await?;

    for job in due {
        let job_id = job.id.clone();
        let expr = job.cron_expression.clone();
        let pool = state.db.clone();
        let full_url = format!("{}{}", job.app_base_url, job.path);

        tokio::spawn(async move {
            let run_id = uuid::Uuid::new_v4();
            let method = job.method.clone();

            if let Err(e) = queries::create_run(&pool, run_id, job_id.clone(), 1, &method, &full_url).await {
                error!("failed to create run record for job {job_id}: {e}");
                return;
            }

            let result = http::execute_job(&job).await;

            if let Err(e) = queries::complete_run(&pool, run_id, &result).await {
                error!("failed to complete run record for job {job_id}: {e}");
            }

            let next_run = match crate::util::calculate_next_run(&expr, Utc::now()) {
                Ok(d) => Some(d),
                Err(e) => {
                    error!("failed to calculate next run for job {job_id}: {e}");
                    None
                }
            };

            let status = if result.status == "success" { "success" } else { "failed" };
            if let Err(e) =
                queries::update_job_timestamps(&pool, job_id.clone(), status, next_run).await
            {
                error!("failed to update job timestamps for {job_id}: {e}");
            }
        });
    }

    Ok(())
}
