import React, { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Divider,
  Checkbox,
  FormControlLabel,
  Link,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import GoogleIcon from "@mui/icons-material/Google";

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
        {/* small brand mark */}
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

        {/* headline */}
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
              Changing the way
              <br />
              the world writes
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

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = useMemo(() => location.state?.from || "/batch", [location.state]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [keep, setKeep] = useState(true);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      await login({ email, password }); // ✅ keep your existing API
      navigate(from, { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Login failed";
      setError(String(msg));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthSplit title="Login" subtitle="Enterprise login with workspace scoping.">
      <Stack spacing={2.1} component="form" onSubmit={submit}>
        {error ? <Alert severity="error">{error}</Alert> : null}

        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          sx={{ py: 1.2, borderRadius: 2.5, fontWeight: 900 }}
          onClick={() => setError("Google sign-in is not wired yet.")}
          disabled={busy}
        >
          Sign in with Google
        </Button>

        <Divider sx={{ opacity: 0.6 }}>Or sign in with email</Divider>

        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          fullWidth
        />

        <TextField
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type={showPw ? "text" : "password"}
          autoComplete="current-password"
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

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <FormControlLabel
            control={<Checkbox checked={keep} onChange={(e) => setKeep(e.target.checked)} />}
            label="Keep me logged in"
          />
          <Link
            component="button"
            type="button"
            underline="hover"
            sx={{ fontWeight: 800 }}
            onClick={() => setError("Forgot password is not wired yet.")}
            disabled={busy}
          >
            Forgot password?
          </Link>
        </Stack>

        <Button type="submit" variant="contained" disabled={busy || !email || !password} sx={{ py: 1.2, borderRadius: 2.5, fontWeight: 950 }}>
          {busy ? "Signing in…" : "Login"}
        </Button>

        <Typography sx={{ textAlign: "center", opacity: 0.75 }}>
          Don’t have an account?{" "}
          <Link sx={{ fontWeight: 950 }} onClick={() => navigate("/register")}>
            Sign up
          </Link>
        </Typography>
      </Stack>
    </AuthSplit>
  );
}
