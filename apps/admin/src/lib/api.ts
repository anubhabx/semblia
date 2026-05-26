import { auth } from "@clerk/nextjs/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

class AdminApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message: string,
  ) {
    super(message);
  }
}

async function authHeaders(): Promise<HeadersInit> {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) {
    throw new AdminApiError(401, null, "No admin session token");
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function adminGet<T>(path: string): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/v2${path}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new AdminApiError(res.status, body, `GET ${path} failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function adminPost<T>(path: string, body: unknown): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/v2${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new AdminApiError(res.status, errBody, `POST ${path} failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export { AdminApiError };
