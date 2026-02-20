// frontend/src/api/auth.js
import { api, setAuth, clearAuth } from "./client";

/**
 * Backend routes:
 *  POST /api/v1/auth/register
 *  POST /api/v1/auth/login
 *  GET  /api/v1/auth/me
 */

export async function registerApi({ name, email, password, workspaceName }) {
  const res = await api.post("/auth/register", { name, email, password, workspaceName });
  return res.data;
}

export async function loginApi({ email, password }) {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
}

export async function meApi() {
  const res = await api.get("/auth/me");
  return res.data;
}

export function applyAuthFromResponse(data) {
  const token = data?.accessToken || "";
  const workspaces = Array.isArray(data?.workspaces) ? data.workspaces : [];

  // Choose workspace:
  // - if backend returns a default, use it
  // - else pick first
  const workspaceId =
    data?.workspaceId ||
    data?.workspace?.workspaceId ||
    workspaces?.[0]?.workspaceId ||
    workspaces?.[0]?._id ||
    "";

  setAuth({ token, workspaceId });
  return { token, workspaceId, workspaces };
}

export function logout() {
  clearAuth();
}
