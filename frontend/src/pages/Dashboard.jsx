import React, { useMemo } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Stack,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import InsightsIcon from "@mui/icons-material/Insights";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  // Demo stats (replace with real API later)
  const stats = useMemo(
    () => [
      { label: "Total Content", value: 50, tone: "primary" },
      { label: "Posted", value: 10, tone: "success" },
      { label: "Scheduled", value: 10, tone: "info" },
      { label: "Drafts", value: 30, tone: "warning" },
      { label: "Platforms", value: 5, tone: "secondary" },
    ],
    []
  );

  return (
    <Stack spacing={2.5}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            SocialFlow
          </Typography>
          <Typography sx={{ opacity: 0.75 }}>
            Multi-platform content hub — batch-first, reliable publishing.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            startIcon={<InsightsIcon />}
            onClick={() => navigate("/analytics")}
            sx={{ borderRadius: 2 }}
          >
            Analytics
          </Button>
          <Button
            variant="outlined"
            startIcon={<CalendarMonthIcon />}
            onClick={() => navigate("/calendar")}
            sx={{ borderRadius: 2 }}
          >
            Calendar
          </Button>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => navigate("/settings")}
            sx={{ borderRadius: 2 }}
          >
            Settings
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/board")}
            sx={{ borderRadius: 2 }}
          >
            Create / Batch
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={2}>
        {stats.map((s) => (
          <Grid key={s.label} item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                {s.value}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                {s.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 2 }}>
        <Typography sx={{ fontWeight: 800, mb: 0.5 }}>What to do next</Typography>
        <Typography sx={{ opacity: 0.75, mb: 1.5 }}>
          SocialFlow’s edge is speed + correctness. The product wins when batch workflows feel effortless.
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
              <Stack spacing={1}>
                <Typography sx={{ fontWeight: 800 }}>Batch Upload</Typography>
                <Typography variant="body2" sx={{ opacity: 0.75 }}>
                  Upload 10–100 assets at once, auto-group into post candidates.
                </Typography>
                <Chip label="Next: drag & drop scheduling" size="small" />
                <Button onClick={() => navigate("/board")} variant="contained" sx={{ mt: 1 }}>
                  Go to Batch Board
                </Button>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
              <Stack spacing={1}>
                <Typography sx={{ fontWeight: 800 }}>Queue Reliability</Typography>
                <Typography variant="body2" sx={{ opacity: 0.75 }}>
                  Track scheduled → publishing → posted, with retries & fixes.
                </Typography>
                <Chip label="SSE-ready status stream" size="small" />
                <Button onClick={() => navigate("/queue")} variant="outlined" sx={{ mt: 1 }}>
                  Open Queue
                </Button>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
              <Stack spacing={1}>
                <Typography sx={{ fontWeight: 800 }}>Themes & Branding</Typography>
                <Typography variant="body2" sx={{ opacity: 0.75 }}>
                  Keep it premium: multi-theme + dark/light for every client.
                </Typography>
                <Chip label="Grey/Purple + Off-white/Green" size="small" />
                <Button onClick={() => navigate("/settings")} variant="outlined" sx={{ mt: 1 }}>
                  Theme Settings
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Stack>
  );
}
