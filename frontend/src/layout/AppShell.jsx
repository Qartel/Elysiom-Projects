// frontend/src/layout/AppShell.jsx
import React, { useContext } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  MenuItem,
  Select,
  Tooltip,
} from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { AppThemeContext } from "../theme/ThemeProvider";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const NAV = [
  { label: "Dashboard", to: "/" },
  { label: "Batch Board", to: "/board" },
  { label: "Calendar", to: "/calendar" },
  { label: "Library", to: "/library" },
  { label: "Queue", to: "/queue" },
  { label: "Settings", to: "/settings" },
];

export default function AppShell() {
  const themeApi = useContext(AppThemeContext);
  const location = useLocation();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Drawer
        variant="permanent"
        PaperProps={{ sx: { width: 260, p: 2, borderRight: "1px solid rgba(255,255,255,0.08)" } }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
          SocialFlow
        </Typography>

        <List sx={{ flex: 1 }}>
          {NAV.map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              selected={location.pathname === item.to}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>

        <Box sx={{ mt: "auto" }}>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            v0.1 • MVP
          </Typography>
        </Box>
      </Drawer>

      <Box sx={{ flex: 1 }}>
        <AppBar position="sticky" elevation={0} color="transparent" sx={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontWeight: 700 }}>Plan-ready UI • Multi-tenant next</Typography>

            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Select
                size="small"
                value={themeApi.preset}
                onChange={(e) => themeApi.setPreset(e.target.value)}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="offwhite-green">Off-white + Green</MenuItem>
                <MenuItem value="grey-purple">Grey + Purple</MenuItem>
              </Select>

              <Tooltip title="Toggle light/dark">
                <IconButton onClick={themeApi.toggleMode}>
                  {themeApi.mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
