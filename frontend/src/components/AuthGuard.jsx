// frontend/src/components/AuthGuard.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";

export default function AuthGuard({ children }) {
  const { loading, isAuthed } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress />
          <Typography sx={{ mt: 2, opacity: 0.75 }}>Checking session…</Typography>
        </Box>
      </Box>
    );
  }

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
