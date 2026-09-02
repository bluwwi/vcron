import type {
  ApiError,
  CreateJobInput,
  DashboardStats,
  Job,
  JobRun,
  PaginatedResult,
  RunWithJobName,
  UpdateJobInput,
} from "./types";

const API_KEY_STORAGE = "vcron_api_key";

export function getApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(API_KEY_STORAGE) || "";
}

export function setApiKey(key: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(API_KEY_STORAGE, key);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.warn(`[vcron] No API key set in localStorage. Go to /settings to set it.`);
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-API-Key": apiKey,
    ...(options.headers as Record<string, string>),
  };

  const method = options.method || "GET";
  console.log(`[vcron] ${method} ${path}`, {
    hasApiKey: !!apiKey,
    keyPreview: apiKey ? `${apiKey.slice(0, 4)}...` : "(empty)",
  });

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
  health: () => request<{ status: string; uptime_seconds: number }>("/api/health-proxy"),

  stats: () => request<DashboardStats>("/api/stats"),

  listJobs: (page = 1, perPage = 20, enabledOnly = false) =>
    request<PaginatedResult<Job>>(
      `/api/jobs?page=${page}&per_page=${perPage}&enabled_only=${enabledOnly}`,
    ),

  getJob: (id: string) => request<Job>(`/api/jobs/${id}`),

  createJob: (input: CreateJobInput) =>
    request<Job>("/api/jobs", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updateJob: (id: string, input: UpdateJobInput) =>
    request<Job>(`/api/jobs/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  deleteJob: (id: string) =>
    request<void>(`/api/jobs/${id}`, { method: "DELETE" }),

  listRuns: (id: string, page = 1, perPage = 20) =>
    request<JobRun[]>(
      `/api/jobs/${id}/runs?page=${page}&per_page=${perPage}`,
    ),

  listAllRuns: (page = 1, perPage = 50, status = "") =>
    request<RunWithJobName[]>(
      `/api/runs?page=${page}&per_page=${perPage}${status ? `&status=${status}` : ""}`,
    ),
};
