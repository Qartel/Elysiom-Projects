import React, { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Divider,
  Button,
  TextField,
} from "@mui/material";

export default function CalendarPage() {
  const [filter, setFilter] = useState("");

  // Demo scheduled items (replace with API)
  const items = useMemo(
    () => [
      { id: "1", title: "LinkedIn: Case study post", when: "2026-02-06 09:00", platform: "LinkedIn", status: "Scheduled" },
      { id: "2", title: "Instagram: Reel teaser", when: "2026-02-07 18:00", platform: "Instagram", status: "Scheduled" },
      { id: "3", title: "YouTube: Short cutdown", when: "2026-02-08 12:00", platform: "YouTube", status: "Scheduled" },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) => `${x.title} ${x.platform}`.toLowerCase().includes(q));
  }, [items, filter]);

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>Calendar</Typography>
        <Typography sx={{ opacity: 0.75 }}>
          This view should become your “schedule confidence” layer.
        </Typography>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }} justifyContent="space-between">
          <TextField
            size="small"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search scheduled content..."
            sx={{ minWidth: { xs: "100%", sm: 420 } }}
          />
          <Stack direction="row" spacing={1}>
            <Button variant="outlined">This Week</Button>
            <Button variant="outlined">Next 30 Days</Button>
            <Button variant="contained">Auto-Schedule</Button>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={1}>
          {filtered.length === 0 ? (
            <Typography sx={{ opacity: 0.7 }}>
              No scheduled items match your search.
            </Typography>
          ) : (
            filtered.map((x) => (
              <Paper key={x.id} variant="outlined" sx={{ p: 1.5 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }} justifyContent="space-between">
                  <Box>
                    <Typography sx={{ fontWeight: 800 }}>{x.title}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.75 }}>
                      {x.when}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={x.platform} size="small" />
                    <Chip label={x.status} size="small" color="primary" />
                    <Button size="small" variant="outlined">Preview</Button>
                  </Stack>
                </Stack>
              </Paper>
            ))
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
