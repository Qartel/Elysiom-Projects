import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Button,
  Divider,
} from "@mui/material";

const BACKEND = process.env.REACT_APP_API_BASE || "http://localhost:7002";

export default function QueuePage() {
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);
  const esRef = useRef(null);

  useEffect(() => {
    const url = `${BACKEND}/api/v1/events/stream`;
    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener("hello", () => setConnected(true));
    es.addEventListener("message", (e) => {
      try {
        const payload = JSON.parse(e.data);
        setEvents((prev) => [payload, ...prev].slice(0, 50));
      } catch {
        setEvents((prev) => [{ raw: e.data }, ...prev].slice(0, 50));
      }
    });

    es.onerror = () => setConnected(false);

    return () => {
      es.close();
      esRef.current = null;
    };
  }, []);

  const demoJobs = useMemo(
    () => [
      { id: "j1", title: "LinkedIn post • Case study", status: "scheduled" },
      { id: "j2", title: "Instagram reel • Teaser", status: "publishing" },
      { id: "j3", title: "YouTube short • Cutdown", status: "failed" },
    ],
    []
  );

  const statusChip = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("posted") || s.includes("success")) return <Chip label="Posted" color="success" size="small" />;
    if (s.includes("publishing") || s.includes("running")) return <Chip label="Publishing" color="primary" size="small" />;
    if (s.includes("failed") || s.includes("error")) return <Chip label="Failed" color="error" size="small" />;
    return <Chip label="Scheduled" color="info" size="small" />;
  };

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>Queue</Typography>
        <Typography sx={{ opacity: 0.75 }}>
          The “trust layer”: scheduled → publishing → posted, with retries & fixes.
        </Typography>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }} justifyContent="space-between">
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={connected ? "Live (SSE Connected)" : "Offline (SSE Disconnected)"}
              color={connected ? "success" : "warning"}
              size="small"
            />
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Endpoint: {BACKEND}/api/v1/events/stream
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => setEvents([])}>Clear Events</Button>
            <Button variant="contained">Retry Failed</Button>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography sx={{ fontWeight: 800, mb: 1 }}>Jobs</Typography>
        <Stack spacing={1} sx={{ mb: 2 }}>
          {demoJobs.map((j) => (
            <Paper key={j.id} variant="outlined" sx={{ p: 1.5 }}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography sx={{ fontWeight: 800 }}>{j.title}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Job ID: {j.id}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  {statusChip(j.status)}
                  <Button size="small" variant="outlined">Details</Button>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>

        <Typography sx={{ fontWeight: 800, mb: 1 }}>Live Events (last 50)</Typography>
        {events.length === 0 ? (
          <Typography sx={{ opacity: 0.7 }}>
            No events yet. When uploads/publishing emit events, they’ll appear here.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {events.map((ev, idx) => (
              <Paper key={idx} variant="outlined" sx={{ p: 1.5 }}>
                <Typography variant="body2" sx={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                  {JSON.stringify(ev, null, 2)}
                </Typography>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}
