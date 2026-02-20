import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Divider,
  Link,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";

function AuthSplit({ title, subtitle, children }) {
  return (
    <Box
      sx={(theme) => ({
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.15fr 0.85fr" }, // left art, right form
        bgcolor: theme.palette.background.default,
      })}
    >
      {/* LEFT: pastel background + headline */}
      <Box
        sx={(theme) => ({
          display: { xs: "none", md: "block" },
          position: "relative",
          overflow: "hidden",
          borderRight: `1px solid ${theme.palette.divider}`,
          background:
            theme.palette.mode === "dark"
              ? `
                radial-gradient(460px 460px at 20% 18%, rgba(125, 211, 252, 0.22), transparent 62%),
                radial-gradient(520px 520px at 70% 22%, rgba(167, 139, 250, 0.20), transparent 63%),
                radial-gradient(520px 520px at 55% 80%, rgba(251, 113, 133, 0.16), transparent 62%),
                radial-gradient(520px 520px at 85% 85%, rgba(34, 197, 94, 0.12), transparent 62%),
                linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))
              `
              : `
                radial-gradient(460px 460px at 20% 18%, rgba(125, 211, 252, 0.55), transparent 62%),
                radial-gradient(520px 520px at 70% 22%, rgba(167, 139, 250, 0.45), transparent 63%),
                radial-gradient(520px 520px at 55% 80%, rgba(251, 113, 133, 0.35), transparent 62%),
                radial-gradient(520px 520px at 85% 85%, rgba(34, 197, 94, 0.22), transparent 62%),
                linear-gradient(180deg, rgba(255,255,255,0.88), rgba(255,255,255,0.70))
              `,
        })}
      >
        <Box sx={{ position: "absolute", top: 28, left: 28, display: "flex", gap: 14, alignItems: "center" }}>
          <Box
            sx={(theme) => ({
              width: 52,
              height: 52,
              borderRadius: 999,
              display: "grid",
              placeItems: "center",
              bgcolor: theme.palette.primary.main,
              color: "#fff",
              fontWeight: 950,
              fontSize: 20,
              boxShadow: `0 18px 60px rgba(139,92,246,0.25)`,
            })}
          >
            S.
          </Box>
        </Box>

        <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", px: 6 }}>
          <Box sx={{ maxWidth: 560 }}>
            <Typography
              sx={(theme) => ({
                fontSize: 46,
                fontWeight: 950,
                lineHeight: 1.05,
                letterSpacing: -1.2,
                color: theme.palette.mode === "dark" ? "rgba(237,235,255,0.92)" : "rgba(0,0,0,0.82)",
              })}
            >
              Create your
              <br />
              first workspace
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* RIGHT: form */}
      <Box sx={{ display: "grid", placeItems: "center", px: { xs: 2, sm: 3, md: 6 }, py: { xs: 3, md: 4 } }}>
        <Paper
          elevation={0}
          sx={(theme) => ({
            width: "100%",
            maxWidth: 460,
            p: { xs: 2.5, sm: 3.25 },
            borderRadius: 4,
            border: `1px solid ${theme.palette.divider}`,
            background: theme.palette.mode === "dark" ? "rgba(11,15,25,0.55)" : "rgba(255,255,255,0.92)",
            backdropFilter: "blur(14px)",
          })}
        >
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Typography sx={{ fontWeight: 950, fontSize: 22 }}>{title}</Typography>
            <Typography sx={{ opacity: 0.7 }}>{subtitle}</Typography>
          </Stack>

          {children}
        </Paper>
      </Box>
    </Box>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      await register({ name, email, password, workspaceName }); // ✅ keep your existing API
      navigate("/batch", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed";
      setError(String(msg));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthSplit
      title="Create workspace"
      subtitle="This creates your user + your first workspace (you become owner)."
    >
      <Stack spacing={2.1} component="form" onSubmit={submit}>
        {error ? <Alert severity="error">{error}</Alert> : null}

        <TextField label="Your name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
        <TextField label="Workspace name" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} fullWidth />
        <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" fullWidth />

        <TextField
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type={showPw ? "text" : "password"}
          autoComplete="new-password"
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPw((s) => !s)} edge="end" disabled={busy}>
                  {showPw ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={busy || !name || !workspaceName || !email || !password}
          sx={{ py: 1.2, borderRadius: 2.5, fontWeight: 950 }}
        >
          {busy ? "Creating…" : "Create account"}
        </Button>

        <Divider sx={{ opacity: 0.6 }} />

        <Typography sx={{ textAlign: "center", opacity: 0.75 }}>
          I already have an account{" "}
          <Link sx={{ fontWeight: 950 }} onClick={() => navigate("/login")}>
            Sign in
          </Link>
        </Typography>
      </Stack>
    </AuthSplit>
  );
}
