import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppThemeProvider from "./theme/AppThemeProvider";

import SocialFlow from "./SocialFlow";
import BatchBoard from "./pages/BatchBoard";
import CalendarPage from "./pages/CalendarPage";
import LibraryPage from "./pages/LibraryPage";
import QueuePage from "./pages/QueuePage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <AppThemeProvider>
      <Routes>
        <Route path="/" element={<SocialFlow />} />
        <Route path="/board" element={<BatchBoard />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/queue" element={<QueuePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/analytics" element={<Navigate to="/" replace />} />
      </Routes>
    </AppThemeProvider>
  );
}
