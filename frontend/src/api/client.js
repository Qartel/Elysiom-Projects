// frontend/src/api/client.js
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// Simple storage (replace with Redux/Zustand later)
export function getAuth() {
  return {
    token: localStorage.getItem("sf_access_token") || "",
    workspaceId: localStorage.getItem("sf_workspace_id") || "",
  };
}

export function setAuth({ token, workspaceId }) {
  if (token) localStorage.setItem("sf_access_token", token);
  if (workspaceId) localStorage.setItem("sf_workspace_id", workspaceId);
}

export function clearAuth() {
  localStorage.removeItem("sf_access_token");
  localStorage.removeItem("sf_workspace_id");
}

api.interceptors.request.use((config) => {
  const { token, workspaceId } = getAuth();

  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (workspaceId) config.headers["X-Workspace-Id"] = workspaceId;

  return config;
});
