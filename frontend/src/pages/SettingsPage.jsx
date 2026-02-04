import React, { useContext } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import { ThemeCtx } from "../theme/AppThemeProvider";

export default function SettingsPage() {
  const themeApi = useContext(ThemeCtx);

  return (
    <Stack spacing={2.5}>
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>Settings</Typography>

      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Typography sx={{ fontWeight: 800 }}>Mode</Typography>
            <Button variant="outlined" onClick={themeApi.toggleMode}>
              {themeApi.mode === "dark" ? "Switch to Light" : "Switch to Dark"}
            </Button>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Typography sx={{ fontWeight: 800 }}>Accent</Typography>
            <Select
              size="small"
              value={themeApi.accent}
              onChange={(e) => themeApi.setAccent(e.target.value)}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="purple">Purple</MenuItem>
              <MenuItem value="green">Green</MenuItem>
            </Select>
          </Stack>
        </Stack>
      </Paper>
    </Box>

      {/* <Paper sx={{ p: 2 }}>
        <Typography sx={{ fontWeight: 900, mb: 1 }}>Appearance</Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
          <FormControl size="small" sx={{ minWidth: 240 }}>
            <InputLabel>Theme Preset</InputLabel>
            <Select
              label="Theme Preset"
              value={themeApi?.preset || "grey-purple"}
              onChange={(e) => themeApi?.setPreset?.(e.target.value)}
            >
              <MenuItem value="grey-purple">Grey + Purple</MenuItem>
              <MenuItem value="offwhite-green">Off-white + Green</MenuItem>
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={`Mode: ${themeApi?.mode || "dark"}`} size="small" />
            <Button variant="outlined" onClick={() => themeApi?.toggleMode?.()}>
              Toggle Light/Dark
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography sx={{ fontWeight: 900, mb: 1 }}>Product Readiness</Typography>
        <Stack spacing={1}>
          <Typography sx={{ opacity: 0.75 }}>
            Next settings that will matter for clients:
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            <Chip label="Workspaces / Tenants" />
            <Chip label="Roles & Approvals" />
            <Chip label="Billing & Plans" />
            <Chip label="Connected Accounts" />
            <Chip label="Audit Logs" />
          </Stack>
        </Stack>
      </Paper> */}

      <Paper sx={{ p: 2 }}>
        <Typography sx={{ fontWeight: 900, mb: 1 }}>Integrations (next)</Typography>
        <Typography sx={{ opacity: 0.75 }}>
          This is where we’ll add platform connections (OAuth), publish limits, and validation rules.
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Stack direction="row" spacing={1}>
          <Button variant="contained">Connect Platform</Button>
          <Button variant="outlined">View Accounts</Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
