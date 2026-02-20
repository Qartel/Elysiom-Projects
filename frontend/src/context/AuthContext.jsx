// frontend/src/context/AuthContext.jsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getAuth, setAuth, clearAuth } from "../api/client";
import { applyAuthFromResponse, loginApi, meApi, registerApi } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // { userId, email, name, status }
  const [workspaces, setWorkspaces] = useState([]); // [{workspaceId,name,role,status}]
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(getAuth().workspaceId || "");

  const hydrate = useCallback(async () => {
    const { token, workspaceId } = getAuth();

    if (!token) {
      setUser(null);
      setWorkspaces([]);
      setActiveWorkspaceId("");
      setLoading(false);
      return;
    }

    try {
      const me = await meApi();
      setUser({
        userId: me?.userId,
        email: me?.email,
        name: me?.name,
        status: me?.status,
      });

      const ws = Array.isArray(me?.workspaces) ? me.workspaces : [];
      setWorkspaces(ws);

      // Keep localStorage workspaceId if valid; else fallback to first
      const valid = ws.some((w) => (w.workspaceId || w._id) === workspaceId);
      const nextWsId = valid ? workspaceId : (ws?.[0]?.workspaceId || ws?.[0]?._id || "");
      setActiveWorkspaceId(nextWsId);
      if (nextWsId) setAuth({ token, workspaceId: nextWsId });
    } catch {
      // token invalid or backend unreachable
      clearAuth();
      setUser(null);
      setWorkspaces([]);
      setActiveWorkspaceId("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = useCallback(async ({ email, password }) => {
    const data = await loginApi({ email, password });
  
    // save token + choose workspace
    const { token, workspaceId, workspaces } = applyAuthFromResponse(data);
  
    // set UI state directly from response (no /me call here)
    setUser({
      userId: data?.user?.userId,
      email: data?.user?.email,
      name: data?.user?.name,
      status: data?.user?.status || "active",
    });
  
    setWorkspaces(workspaces);
    setActiveWorkspaceId(workspaceId);
    setLoading(false);
  
    return { token, workspaceId };
  }, []);
  
  const register = useCallback(async ({ name, email, password, workspaceName }) => {
    const data = await registerApi({ name, email, password, workspaceName });
  
    const { token, workspaceId, workspaces } = applyAuthFromResponse(data);
  
    setUser({
      userId: data?.user?.userId,
      email: data?.user?.email,
      name: data?.user?.name,
      status: data?.user?.status || "active",
    });
  
    setWorkspaces(workspaces);
    setActiveWorkspaceId(workspaceId);
    setLoading(false);
  
    return { token, workspaceId };
  }, []);
  

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setWorkspaces([]);
    setActiveWorkspaceId("");
  }, []);

  const setWorkspace = useCallback((workspaceId) => {
    const { token } = getAuth();
    if (!token) return;

    setActiveWorkspaceId(workspaceId);
    setAuth({ token, workspaceId });
  }, []);

  const activeWorkspace = useMemo(() => {
    return workspaces.find((w) => (w.workspaceId || w._id) === activeWorkspaceId) || null;
  }, [workspaces, activeWorkspaceId]);

  const value = useMemo(() => ({
    loading,
    user,
    workspaces,
    activeWorkspaceId,
    activeWorkspace,
    isAuthed: !!user,
    login,
    register,
    logout,
    setWorkspace,
    refresh: hydrate,
  }), [loading, user, workspaces, activeWorkspaceId, activeWorkspace, login, register, logout, setWorkspace, hydrate]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
