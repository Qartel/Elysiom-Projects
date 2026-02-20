// frontend/src/components/TopBar.jsx
import React, { useMemo, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Chip,
  Button,
  Menu,
  MenuItem,
  Divider,
  FormControl,
  Select,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function roleLabel(role) {
  const r = String(role || "").toLowerCase();
  if (!r) return "member";
  return r;
}

export default function TopBar() {
  const navigate = useNavigate();
  const { user, workspaces, activeWorkspaceId, activeWorkspace, setWorkspace, logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const displayName = useMemo(() => {
    if (!user) return "Guest";
    return user.name || user.email || "User";
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        backdropFilter: "blur(10px)",
        backgroundColor: "rgba(0,0,0,0.35)",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 900, letterSpacing: 0.2 }} noWrap>
            SocialFlow
          </Typography>

          {activeWorkspace ? (
            <Chip
              size="small"
              label={`Workspace: ${
                activeWorkspace.name ||
                activeWorkspace.slug ||
                activeWorkspace.workspaceId ||
                activeWorkspace._id
              }`}
              variant="outlined"
              sx={{ opacity: 0.9 }}
            />
          ) : null}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {user ? (
            <>
              <Tooltip title="Active workspace">
                <FormControl size="small" sx={{ minWidth: 240 }}>
                  <Select
                    value={activeWorkspaceId || ""}
                    onChange={(e) => setWorkspace(e.target.value)}
                    displayEmpty
                    renderValue={(val) => {
                      const ws = workspaces.find((w) => (w.workspaceId || w._id) === val);
                      if (!ws) return "Select workspace";
                      const name = ws.name || ws.slug || ws.workspaceId || ws._id;
                      const role = roleLabel(ws.role);
                      return `${name} • ${role}`;
                    }}
                  >
                    {workspaces.map((w) => {
                      const id = w.workspaceId || w._id;
                      const name = w.name || w.slug || id;
                      return (
                        <MenuItem key={id} value={id}>
                          {name} — {roleLabel(w.role)}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Tooltip>

              <Button
                variant="outlined"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  textTransform: "none",
                  borderColor: "rgba(255,255,255,0.22)",
                }}
              >
                {displayName}
              </Button>

              <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
                <MenuItem disabled>{user.email}</MenuItem>
                <Divider />
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null);
                    navigate("/queue");
                  }}
                >
                  Queue
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null);
                    navigate("/batch");
                  }}
                >
                  Batch Board
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null);
                    handleLogout();
                  }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                onClick={() => navigate("/login")}
                sx={{ textTransform: "none" }}
              >
                Sign in
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
