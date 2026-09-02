use chrono::{DateTime, TimeZone, Utc};
use cron::Schedule;
use std::str::FromStr;

pub fn validate_cron_expression(expr: &str) -> Result<(), String> {
    Schedule::from_str(expr).map_err(|e| format!("invalid cron expression: {e}"))?;
    Ok(())
}

pub fn calculate_next_run(expr: &str, from: DateTime<Utc>) -> Result<DateTime<Utc>, String> {
    let schedule = Schedule::from_str(expr).map_err(|e| format!("invalid cron expression: {e}"))?;
    schedule
        .upcoming(Utc)
        .next()
        .ok_or_else(|| "no upcoming runs for cron expression".into())
}

pub fn parse_datetime(s: &str) -> Option<DateTime<Utc>> {
    DateTime::parse_from_rfc3339(s)
        .ok()
        .map(|d| d.with_timezone(&Utc))
}

pub fn parse_bool(s: &str) -> bool {
    matches!(s.to_lowercase().as_str(), "1" | "true" | "t" | "yes")
}
