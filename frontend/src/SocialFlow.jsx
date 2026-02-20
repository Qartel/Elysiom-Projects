// frontend/src/SocialFlow.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Chip,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import InsightsIcon from "@mui/icons-material/Insights";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";
import ListAltIcon from "@mui/icons-material/ListAlt";

// Data
import { platforms, contentLibrary, platformStats, getTotalStats } from "./socialMediaContent";

const PLATFORM_ACCENTS = {
  instagram: "#E1306C",
  youtube: "#FF0000",
  linkedin: "#0A66C2",
  facebook: "#1877F2",
  threads: "#FFFFFF",
};

const PLATFORM_BRAND = {
  instagram: {
    name: "Instagram",
    accent: "#E1306C",
    headerBg:
      "linear-gradient(135deg, #feda75 0%, #fa7e1e 25%, #d62976 50%, #962fbf 75%, #4f5bd5 100%)",
  },
  youtube: {
    name: "YouTube",
    accent: "#FF0000",
    headerBg: "linear-gradient(135deg, rgba(255,0,0,0.92), rgba(255,0,0,0.40))",
  },
  linkedin: {
    name: "LinkedIn",
    accent: "#0A66C2",
    headerBg: "linear-gradient(135deg, rgba(10,102,194,0.90), rgba(10,102,194,0.35))",
  },
  facebook: {
    name: "Facebook",
    accent: "#1877F2",
    headerBg: "linear-gradient(135deg, rgba(24,119,242,0.90), rgba(24,119,242,0.35))",
  },
  threads: {
    name: "Threads",
    accent: "#FFFFFF",
    headerBg: "linear-gradient(135deg, rgba(255,255,255,0.20), rgba(255,255,255,0.06))",
  },
};

function a11yProps(index) {
  return { id: `platform-tab-${index}`, "aria-controls": `platform-tabpanel-${index}` };
}

/** “Real icon” feel without extra deps: a branded badge circle. */
function PlatformBadge({ id }) {
  const accent = PLATFORM_ACCENTS[id] || "#8B5CF6";

  // Simple lettermark (fast + clean). Later we can swap to actual SVG icons per platform.
  const letter =
    id === "instagram" ? "IG" :
    id === "youtube" ? "YT" :
    id === "linkedin" ? "in" :
    id === "facebook" ? "f" :
    id === "threads" ? "@" :
    id.slice(0, 2).toUpperCase();

  return (
    <Box
      sx={{
        width: 26,
        height: 26,
        borderRadius: 999,
        display: "grid",
        placeItems: "center",
        color: id === "threads" ? "#000" : "#fff",
        fontSize: 12,
        fontWeight: 900,
        border: `1px solid ${accent}55`,
        background:
          id === "instagram"
            ? "linear-gradient(135deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)"
            : id === "threads"
            ? "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.65))"
            : `${accent}`,
        boxShadow: `0 10px 30px ${accent}22`,
      }}
    >
      {letter}
    </Box>
  );
}

function StatCard({ label, value, tone = "primary", accent }) {
  const chipColor =
    tone === "success" ? "success" :
    tone === "info" ? "info" :
    tone === "warning" ? "warning" :
    tone === "secondary" ? "secondary" : "primary";

  return (
    <Paper
      sx={{
        p: 2,
        position: "relative",
        overflow: "hidden",
        transition: "transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: accent ? `${accent}66` : "rgba(139,92,246,0.50)",
          boxShadow: accent ? `0 18px 60px ${accent}22` : "0 18px 60px rgba(139,92,246,0.18)",
        },
        "&:before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: `radial-gradient(700px 240px at 20% 0%, ${accent}12, transparent 60%)`,
          pointerEvents: "none",
        },
      }}
    >
      <Stack spacing={0.5} sx={{ position: "relative" }}>
        <Typography variant="h5" sx={{ fontWeight: 950, lineHeight: 1 }}>
          {value}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" sx={{ opacity: 0.75 }}>
            {label}
          </Typography>
          <Chip size="small" label="Live" color={chipColor} variant="outlined" />
        </Stack>
      </Stack>
    </Paper>
  );
}

function Column({ title, count, items, accent }) {
  return (
    <Paper
      sx={{
        p: 2,
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(900px 280px at 20% 0%, ${accent}10, transparent 60%)`,
          pointerEvents: "none",
        }}
      />
      <Stack sx={{ position: "relative" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography sx={{ fontWeight: 950 }}>{title}</Typography>
          <Chip size="small" label={count} />
        </Stack>
        <Divider sx={{ mb: 1.5 }} />
        <Stack spacing={1}>
          {items.length === 0 ? (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Nothing here yet.
            </Typography>
          ) : (
            items.slice(0, 5).map((x) => (
              <Paper
                key={x.id}
                variant="outlined"
                sx={{
                  p: 1.25,
                  transition: "transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    borderColor: `${accent}66`,
                    boxShadow: `0 16px 50px ${accent}18`,
                    background: `linear-gradient(180deg, ${accent}10, transparent 55%)`,
                  },
                }}
              >
                <Stack spacing={0.5}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography sx={{ fontWeight: 850 }} noWrap>
                      {x.title}
                    </Typography>
                    <Chip size="small" label={x.type || "post"} />
                  </Stack>
                  <Typography variant="body2" sx={{ opacity: 0.75 }}>
                    {x.category || "content"}
                  </Typography>
                </Stack>
              </Paper>
            ))
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}

export default function SocialFlow() {
  const navigate = useNavigate();
  const theme = useTheme();

  const totalStats = getTotalStats();
  const [selectedPlatform, setSelectedPlatform] = useState(platforms?.[0]?.id || "instagram");
  const [searchQuery, setSearchQuery] = useState("");

  const brand =
    PLATFORM_BRAND[selectedPlatform] || {
      name: "Platform",
      accent: theme.palette.primary.main,
      headerBg: "rgba(255,255,255,0.04)",
    };

  const platformAccent = brand.accent;

  const currentPlatform = useMemo(
    () => platforms.find((p) => p.id === selectedPlatform) || platforms[0],
    [selectedPlatform]
  );

  const platformItems = contentLibrary?.[selectedPlatform] || [];

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return platformItems;
    return platformItems.filter((x) =>
      `${x.title || ""} ${x.category || ""} ${x.type || ""}`.toLowerCase().includes(q)
    );
  }, [platformItems, searchQuery]);

  const drafts = filtered.filter((x) => (x.status || "").toLowerCase() === "draft");
  const scheduled = filtered.filter((x) => (x.status || "").toLowerCase() === "scheduled");
  const posted = filtered.filter((x) => (x.status || "").toLowerCase() === "posted");

  const statsForPlatform =
    platformStats?.[selectedPlatform] || { posted: 0, scheduled: 0, draft: 0, total: 0, engagement: 0 };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      {/* Header */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          borderBottom: "1px solid",
          borderColor: "divider",
          backdropFilter: "blur(14px)",
          bgcolor: theme.palette.mode === "dark" ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.55)",
        }}
      >
        <Box sx={{ maxWidth: 1800, mx: "auto", px: 3, py: 2 }}>
          {/* Top Bar */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ md: "center" }}
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "primary.main",
                  boxShadow: `0 10px 40px ${theme.palette.primary.main}22`,
                }}
              >
                <Typography sx={{ fontSize: 22 }}>🚀</Typography>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 950, lineHeight: 1.1 }}>
                  SocialFlow
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  Multi-Platform Content Hub
                </Typography>
              </Box>
            </Stack>


            <Stack
              direction="row"
              spacing={1}
              sx={{ flexWrap: "wrap", justifyContent: { xs: "flex-start", md: "flex-end" } }}
            >
              <Button variant="outlined" startIcon={<InsightsIcon />} onClick={() => navigate("/analytics")}>
                Analytics
              </Button>
              <Button variant="outlined" startIcon={<CalendarMonthIcon />} onClick={() => navigate("/calendar")}>
                Calendar
              </Button>
              <Button variant="outlined" startIcon={<CollectionsBookmarkIcon />} onClick={() => navigate("/library")}>
                Library
              </Button>
              <Button variant="outlined" startIcon={<ListAltIcon />} onClick={() => navigate("/queue")}>
                Queue
              </Button>
              <Button variant="outlined" startIcon={<SettingsIcon />} onClick={() => navigate("/settings")}>
                Settings
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/board")}>
                Create Content
              </Button>
            </Stack>
          </Stack>

          {/* Global Stats - fill row */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(5, 1fr)" },
              gap: 2,
              mb: 2,
            }}
          >
            <StatCard label="Total Content" value={totalStats.total} tone="primary" accent={platformAccent} />
            <StatCard label="Posted" value={totalStats.posted} tone="success" accent={platformAccent} />
            <StatCard label="Scheduled" value={totalStats.scheduled} tone="info" accent={platformAccent} />
            <StatCard label="Drafts" value={totalStats.draft} tone="warning" accent={platformAccent} />
            <StatCard label="Platforms" value={platforms.length} tone="secondary" accent={platformAccent} />
          </Box>

          {/* Platform Tabs (brand tinted) */}
          <Paper
            sx={{
              p: 1,
              position: "relative",
              overflow: "hidden",
              "&:before": {
                content: '""',
                position: "absolute",
                inset: 0,
                background: brand.headerBg,
                opacity: 0.12,
                pointerEvents: "none",
              },
            }}
          >
            <Tabs
              sx={{ position: "relative" }}
              value={selectedPlatform}
              onChange={(_, v) => setSelectedPlatform(v)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {platforms.map((p, idx) => {
                const accent = PLATFORM_ACCENTS[p.id] || theme.palette.primary.main;
                return (
                  <Tab
                    key={p.id}
                    value={p.id}
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PlatformBadge id={p.id} />
                        <Typography sx={{ fontWeight: 900 }}>{p.name}</Typography>
                        <Chip size="small" label={platformStats[p.id]?.total ?? 0} />
                      </Stack>
                    }
                    {...a11yProps(idx)}
                    sx={{
                      "&:hover": { backgroundColor: `${accent}12` },
                      "&.Mui-selected": {
                        backgroundColor: `${accent}16`,
                        boxShadow: `inset 0 0 0 1px ${accent}40`,
                      },
                    }}
                  />
                );
              })}
            </Tabs>
          </Paper>
        </Box>
      </Box>

      {/* Main */}
      <Box sx={{ maxWidth: 1800, mx: "auto", px: 3, py: 3 }}>
        {/* Search + actions */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder={`Search ${currentPlatform?.name || ""} content...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                boxShadow: `0 0 0 1px ${platformAccent}22`,
                "&:hover": { boxShadow: `0 0 0 1px ${platformAccent}55` },
                "&.Mui-focused": { boxShadow: `0 0 0 1px ${platformAccent}88` },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ opacity: 0.7 }} />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={() => navigate("/board")}
            sx={{
              whiteSpace: "nowrap",
              borderColor: `${platformAccent}55`,
              "&:hover": { borderColor: `${platformAccent}AA`, backgroundColor: `${platformAccent}10` },
            }}
          >
            Duplicate to Other Platforms
          </Button>
        </Stack>

        {/* Platform summary row (brand background, white text) */}
        <Paper
          sx={{
            p: 2,
            mb: 2,
            position: "relative",
            overflow: "hidden",
            color: "#fff",
            borderColor: `${platformAccent}66`,
            "&:before": {
              content: '""',
              position: "absolute",
              inset: 0,
              background: brand.headerBg,
              opacity: 0.26,
              pointerEvents: "none",
            },
            "&:after": {
              content: '""',
              position: "absolute",
              inset: 0,
              background: `radial-gradient(900px 260px at 20% 0%, ${platformAccent}28, transparent 62%)`,
              pointerEvents: "none",
            },
          }}
        >
          <Stack
            sx={{ position: "relative" }}
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ md: "center" }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <PlatformBadge id={selectedPlatform} />
              <Box>
                <Typography sx={{ fontWeight: 950, fontSize: 18, color: "#fff" }}>{brand.name}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.88, color: "rgba(255,255,255,0.88)" }}>
                  {statsForPlatform.total} pieces • {statsForPlatform.posted} posted • {statsForPlatform.scheduled} scheduled •{" "}
                  {statsForPlatform.draft} drafts
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap", gap: 1 }}>
              <Chip
                sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.35)" }}
                variant="outlined"
                label={`Avg Engagement: ${statsForPlatform.engagement || statsForPlatform.avgEngagement || "—"}`}
              />
              <Tooltip title="Switch view (next)">
                <IconButton sx={{ color: "#fff" }}>
                  <InsightsIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Paper>

        {/* Board Preview - fill width */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 2,
          }}
        >
          <Column title="Drafts" count={drafts.length} items={drafts} accent={platformAccent} />
          <Column title="Scheduled" count={scheduled.length} items={scheduled} accent={platformAccent} />
          <Column title="Posted" count={posted.length} items={posted} accent={platformAccent} />
        </Box>
      </Box>
    </Box>
  );
}
