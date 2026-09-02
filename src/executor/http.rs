use std::collections::HashMap;
use std::time::Instant;

use reqwest::Client;
use tracing::warn;

use crate::db::models::{JobWithApp, RunResult};

static CLIENT: tokio::sync::OnceCell<Client> = tokio::sync::OnceCell::const_new();

async fn client() -> &'static Client {
    CLIENT
        .get_or_init(|| async {
            Client::builder()
                .pool_idle_timeout(Some(std::time::Duration::from_secs(30)))
                .build()
                .expect("failed to build reqwest client")
        })
        .await
}

pub async fn execute_job(job: &JobWithApp) -> RunResult {
    let cli = client().await;
    let started = Instant::now();

    let full_url = format!("{}{}", job.app_base_url, job.path);

    let mut headers_map = HashMap::new();
    if let serde_json::Value::Object(map) = &job.headers {
        for (k, v) in map {
            if let Some(s) = v.as_str() {
                headers_map.insert(k.clone(), s.to_string());
            }
        }
    }

    let max_attempts = (job.retry_count + 1).max(1);
    let timeout = std::time::Duration::from_secs(job.timeout_seconds as u64);
    let mut last_error: Option<String> = None;
    let mut last_status_code: Option<i32> = None;
    let mut last_body: Option<String> = None;

    for attempt in 1..=max_attempts {
        let mut request = match job.method.as_str() {
            "GET" => cli.get(&full_url),
            "POST" => cli.post(&full_url),
            "PUT" => cli.put(&full_url),
            "DELETE" => cli.delete(&full_url),
            "PATCH" => cli.patch(&full_url),
            other => {
                return RunResult {
                    status: "failed".into(),
                    status_code: None,
                    response_body: None,
                    duration_ms: started.elapsed().as_millis() as i32,
                    error_message: Some(format!("unsupported method: {other}")),
                }
            }
        };

        for (k, v) in &headers_map {
            request = request.header(k, v);
        }
        if let Some(ref body) = job.body {
            request = request.body(body.clone());
        }
        request = request.timeout(timeout);

        match request.send().await {
            Ok(resp) => {
                let status_code = resp.status().as_u16() as i32;
                let is_success = resp.status().is_success();
                let body_text = resp.text().await.ok();
                let truncated = body_text
                    .as_deref()
                    .map(|b| if b.len() > 65536 { &b[..65536] } else { b })
                    .map(|s| s.to_string());

                last_status_code = Some(status_code);
                last_body = truncated.clone();

                if is_success {
                    return RunResult {
                        status: "success".into(),
                        status_code: Some(status_code),
                        response_body: truncated,
                        duration_ms: started.elapsed().as_millis() as i32,
                        error_message: None,
                    };
                }

                last_error = Some(format!("HTTP {status_code}"));
                if attempt < max_attempts {
                    let backoff = 2u64.pow(attempt as u32 - 1);
                    warn!("job {} attempt {attempt} got {status_code}, retrying in {backoff}s", job.id);
                    tokio::time::sleep(std::time::Duration::from_secs(backoff)).await;
                }
            }
            Err(e) => {
                let is_timeout = e.is_timeout();
                last_error = Some(e.to_string());
                if attempt < max_attempts {
                    let backoff = 2u64.pow(attempt as u32 - 1);
                    warn!("job {} attempt {attempt} error: {e}, retrying in {backoff}s", job.id);
                    tokio::time::sleep(std::time::Duration::from_secs(backoff)).await;
                } else if is_timeout {
                    return RunResult {
                        status: "timeout".into(),
                        status_code: None,
                        response_body: None,
                        duration_ms: started.elapsed().as_millis() as i32,
                        error_message: last_error,
                    };
                }
            }
        }
    }

    RunResult {
        status: "failed".into(),
        status_code: last_status_code,
        response_body: last_body,
        duration_ms: started.elapsed().as_millis() as i32,
        error_message: last_error,
    }
}
