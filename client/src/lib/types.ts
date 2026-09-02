export interface App {
  id: string;
  name: string;
  base_url: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAppInput {
  name: string;
  base_url: string;
  description?: string;
}

export interface UpdateAppInput {
  name?: string;
  base_url?: string;
  description?: string;
}

export interface AppStats {
  app_id: string;
  job_count: number;
  enabled_count: number;
  last_run: string | null;
}

export interface Job {
  id: string;
  app_id: string;
  name: string;
  description: string;
  cron_expression: string;
  path: string;
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

export interface JobWithApp extends Job {
  app_name: string;
  app_base_url: string;
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

export interface RunWithJobAndApp extends JobRun {
  job_name: string;
  app_name: string;
  app_base_url: string;
}

export interface DashboardStats {
  total_apps: number;
  total_jobs: number;
  enabled_jobs: number;
  due_jobs: number;
  total_requests: number;
  runs_today: number;
}

export interface CreateJobInput {
  app_id: string;
  name: string;
  description?: string;
  cron_expression: string;
  path?: string;
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
  path?: string;
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
