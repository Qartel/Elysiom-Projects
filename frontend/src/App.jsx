// frontend/src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@mui/material";

import { AuthProvider } from "./context/AuthContext";
import AuthGuard from "./components/AuthGuard";
import TopBar from "./components/TopBar";

import SocialFlow from "./SocialFlow";

import CalendarPage from "./pages/CalendarPage";
import LibraryPage from "./pages/LibraryPage";
import SettingsPage from "./pages/SettingsPage";
import BatchBoard from "./pages/BatchBoard";
import QueuePage from "./pages/QueuePage";
import Login from "./pages/Login";
import Register from "./pages/Register";

function AuthShell({ children }) {
  return (
    <Box sx={{ minHeight: "100vh", px: { xs: 2, md: 3 }, py: { xs: 3, md: 4 } }}>
      {children}
    </Box>
  );
}

function AppShell({ children }) {
  return (
    <>
      <TopBar />
      {/* SocialFlow already manages its own layout, pages can be constrained if they want */}
      {children}
    </>
  );
}

function Constrained({ children }) {
  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 3 }, py: 3 }}>
      {children}
    </Box>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            <AuthShell>
              <Login />
            </AuthShell>
          }
        />
        <Route
          path="/register"
          element={
            <AuthShell>
              <Register />
            </AuthShell>
          }
        />

        {/* Private */}
        <Route
          path="/"
          element={
            <AuthGuard>
              <AppShell>
                <SocialFlow />
              </AppShell>
            </AuthGuard>
          }
        />

        <Route
          path="/calendar"
          element={
            <AuthGuard>
              <AppShell>
                <Constrained>
                  <CalendarPage />
                </Constrained>
              </AppShell>
            </AuthGuard>
          }
        />
        <Route
          path="/library"
          element={
            <AuthGuard>
              <AppShell>
                <Constrained>
                  <LibraryPage />
                </Constrained>
              </AppShell>
            </AuthGuard>
          }
        />
        <Route
          path="/settings"
          element={
            <AuthGuard>
              <AppShell>
                <Constrained>
                  <SettingsPage />
                </Constrained>
              </AppShell>
            </AuthGuard>
          }
        />

        <Route
          path="/board"
          element={
            <AuthGuard>
              <AppShell>
                <Constrained>
                  <BatchBoard />
                </Constrained>
              </AppShell>
            </AuthGuard>
          }
        />
        <Route
          path="/queue"
          element={
            <AuthGuard>
              <AppShell>
                <Constrained>
                  <QueuePage />
                </Constrained>
              </AppShell>
            </AuthGuard>
          }
        />

        {/* Back-compat */}
        <Route path="/batch" element={<Navigate to="/board" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
