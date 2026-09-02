import type {
  ApiError,
  App,
  AppStats,
  CreateAppInput,
  CreateJobInput,
  DashboardStats,
  Job,
  JobRun,
  JobWithApp,
  RunWithJobAndApp,
  UpdateAppInput,
  UpdateJobInput,
} from "./types";

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const method = options.method || "GET";
  const res = await fetch(path, { ...options, headers });

  console.log(`[vcron] ${method} ${path} → ${res.status}`);

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as ApiError;
      message = body.error || message;
    } catch {
      // ignore parse error
    }
    console.error(`[vcron] ${method} ${path} failed: ${message}`);
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  // Apps
  listApps: () => request<App[]>("/api/apps"),
  getApp: (id: string) => request<App>(`/api/apps/${id}`),
  createApp: (input: CreateAppInput) =>
    request<App>("/api/apps", { method: "POST", body: JSON.stringify(input) }),
  updateApp: (id: string, input: UpdateAppInput) =>
    request<App>(`/api/apps/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  deleteApp: (id: string) => request<void>(`/api/apps/${id}`, { method: "DELETE" }),
  listAppJobs: (id: string) => request<Job[]>(`/api/apps/${id}/jobs`),
  appStats: () => request<AppStats[]>("/api/apps/stats"),

  // Jobs
  listAllJobs: () => request<JobWithApp[]>("/api/jobs"),
  getJob: (id: string) => request<JobWithApp>(`/api/jobs/${id}`),
  createJob: (input: CreateJobInput) =>
    request<Job>("/api/jobs", { method: "POST", body: JSON.stringify(input) }),
  updateJob: (id: string, input: UpdateJobInput) =>
    request<Job>(`/api/jobs/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  deleteJob: (id: string) => request<void>(`/api/jobs/${id}`, { method: "DELETE" }),

  // Runs
  listRuns: (jobId: string, page = 1, perPage = 50) =>
    request<JobRun[]>(`/api/jobs/${jobId}/runs?page=${page}&per_page=${perPage}`),
  listAllRuns: (page = 1, perPage = 50, status = "") =>
    request<RunWithJobAndApp[]>(
      `/api/runs?page=${page}&per_page=${perPage}${status ? `&status=${status}` : ""}`,
    ),

  // Stats
  stats: () => request<DashboardStats>("/api/stats"),
};
