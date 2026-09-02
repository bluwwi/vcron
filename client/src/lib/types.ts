export interface Job {
  id: string;
  name: string;
  description: string;
  cron_expression: string;
  url: string;
  method: string;
  headers: Record<string, unknown>;
  body: string | null;
  timeout_seconds: number;
  retry_count: number;
  enabled: boolean;
  last_run_at: string | null;
  last_run_status: string | null;
  next_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobRun {
  id: string;
  job_id: string;
  status: string;
  status_code: number | null;
  response_body: string | null;
  request_method: string | null;
  request_url: string | null;
  duration_ms: number | null;
  error_message: string | null;
  attempt_number: number;
  started_at: string;
  finished_at: string | null;
}

export interface RunWithJobName extends JobRun {
  job_name: string;
}

export interface DashboardStats {
  total_jobs: number;
  enabled_jobs: number;
  due_jobs: number;
  recent_failures: number;
  runs_today: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface CreateJobInput {
  name: string;
  description?: string;
  cron_expression: string;
  url: string;
  method?: string;
  headers?: Record<string, unknown>;
  body?: string;
  timeout_seconds?: number;
  retry_count?: number;
  enabled?: boolean;
}

export interface UpdateJobInput {
  name?: string;
  description?: string;
  cron_expression?: string;
  url?: string;
  method?: string;
  headers?: Record<string, unknown>;
  body?: string;
  timeout_seconds?: number;
  retry_count?: number;
  enabled?: boolean;
}

export interface ApiError {
  error: string;
}
