import type {
  ApiError,
  CreateJobInput,
  DashboardStats,
  Job,
  JobRun,
  PaginatedResult,
  UpdateJobInput,
} from "./types";

const API_KEY_STORAGE = "revocron_api_key";

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
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-API-Key": apiKey,
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(path, { ...options, headers });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as ApiError;
      message = body.error || message;
    } catch {
      // ignore parse error
    }
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
};
