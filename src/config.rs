use std::env;

#[derive(Clone, Debug)]
pub struct Config {
    pub database_url: String,
    pub port: u16,
    pub log_level: String,
    pub scheduler_interval_seconds: u64,
}

impl Config {
    pub fn from_env() -> Self {
        dotenvy::dotenv().ok();

        Self {
            database_url: env::var("DATABASE_URL")
                .unwrap_or_else(|_| "sqlite:data/vcron.db?mode=rwc".into()),
            port: env::var("PORT")
                .unwrap_or_else(|_| "8080".into())
                .parse()
                .expect("PORT must be a number"),
            log_level: env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
            scheduler_interval_seconds: env::var("SCHEDULER_INTERVAL_SECONDS")
                .unwrap_or_else(|_| "5".into())
                .parse()
                .unwrap_or(5),
        }
    }
}
