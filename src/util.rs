use chrono::{DateTime, Utc};
use cron::Schedule;
use std::str::FromStr;

pub fn validate_cron_expression(expr: &str) -> Result<(), String> {
    if let Some(rest) = expr.strip_prefix("interval:") {
        let secs: u64 = rest
            .trim()
            .parse()
            .map_err(|_| "interval must be a number of seconds".to_string())?;
        if secs == 0 {
            return Err("interval must be at least 1 second".into());
        }
        return Ok(());
    }

    Schedule::from_str(expr).map_err(|e| format!("invalid cron expression: {e}"))?;
    Ok(())
}

pub fn calculate_next_run(expr: &str, _from: DateTime<Utc>) -> Result<DateTime<Utc>, String> {
    if let Some(rest) = expr.strip_prefix("interval:") {
        let secs: u64 = rest
            .trim()
            .parse()
            .map_err(|_| "interval must be a number of seconds".to_string())?;
        if secs == 0 {
            return Err("interval must be at least 1 second".into());
        }
        return Ok(Utc::now() + chrono::Duration::seconds(secs as i64));
    }

    let schedule = Schedule::from_str(expr).map_err(|e| format!("invalid cron expression: {e}"))?;
    schedule
        .upcoming(Utc)
        .next()
        .ok_or_else(|| "no upcoming runs for cron expression".into())
}
