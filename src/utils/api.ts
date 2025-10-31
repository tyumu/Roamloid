export const API_BASE: string = (import.meta as any)?.env?.VITE_API_BASE_URL || "http://localhost:5000";

export type ApiResult<T> = {
  ok: boolean;
  status: number;
  data: T;
};

export async function apiFetch<T = any>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
    headers,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // no body
  }
  return { ok: res.ok, status: res.status, data } as ApiResult<T>;
}

// Convenience auth calls
export const AuthApi = {
  login: (username: string, password: string) =>
    apiFetch<{ message?: string; error_message?: string }>(`/api/auth/login`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  signup: (username: string, password: string) =>
    apiFetch<{ message?: string; error_message?: string }>(`/api/auth/signup`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  detail: () => apiFetch<{ id: string; username: string }>(`/api/auth/detail`),
  logout: () => apiFetch<{ message: string }>(`/api/auth/logout`, { method: "POST" }),
};
