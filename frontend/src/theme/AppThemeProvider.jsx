// frontend/src/theme/AppThemeProvider.jsx
import React, { createContext, useEffect, useMemo, useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createAppTheme } from "./presets";

export const ThemeCtx = createContext(null);

const STORAGE_KEY = "socialflow_theme_v3";

const getInitial = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { mode: "dark", accent: "purple" };
    const p = JSON.parse(raw);
    return { mode: p.mode ?? "dark", accent: p.accent ?? "purple" };
  } catch {
    return { mode: "dark", accent: "purple" };
  }
};

export default function AppThemeProvider({ children }) {
  const [state, setState] = useState(getInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const theme = useMemo(() => createAppTheme(state), [state]);

  const api = useMemo(
    () => ({
      mode: state.mode,
      accent: state.accent,
      setMode: (mode) => setState((s) => ({ ...s, mode })),
      toggleMode: () => setState((s) => ({ ...s, mode: s.mode === "dark" ? "light" : "dark" })),
      setAccent: (accent) => setState((s) => ({ ...s, accent })),
    }),
    [state]
  );

  return (
    <ThemeCtx.Provider value={api}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeCtx.Provider>
  );
}
