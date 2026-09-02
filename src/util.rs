use chrono::{DateTime, Utc};
use cron::Schedule;
use std::str::FromStr;

pub fn validate_cron_expression(expr: &str) -> Result<(), String> {
    Schedule::from_str(expr).map_err(|e| format!("invalid cron expression: {e}"))?;
    Ok(())
}

pub fn calculate_next_run(expr: &str, _from: DateTime<Utc>) -> Result<DateTime<Utc>, String> {
    let schedule = Schedule::from_str(expr).map_err(|e| format!("invalid cron expression: {e}"))?;
    schedule
        .upcoming(Utc)
        .next()
        .ok_or_else(|| "no upcoming runs for cron expression".into())
}
