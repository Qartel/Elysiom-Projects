// frontend/src/pages/QueuePage.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Button,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

import { getAuth } from "../api/client";

const BACKEND =
  process.env.REACT_APP_BACKEND_URL ||
  process.env.REACT_APP_API_BASE

const JOBS_ENDPOINT = `${BACKEND}/api/v1/jobs`;

// WS endpoint (convert http -> ws)
const WS_ENDPOINT = `${BACKEND.replace(/^http/i, "ws")}/api/v1/ws`;

function normalizeStatus(status) {
  const s = String(status || "").toLowerCase();
  if (["posted", "success", "succeeded", "completed", "done"].includes(s)) return "posted";
  if (["publishing", "running", "processing", "in_progress"].includes(s)) return "publishing";
  if (["failed", "error"].includes(s)) return "failed";
  if (["queued"].includes(s)) return "queued";
  if (["scheduled"].includes(s)) return "scheduled";
  return s || "scheduled";
}

function statusChip(status) {
  const s = normalizeStatus(status);
  if (s === "posted") return <Chip label="Posted" color="success" size="small" />;
  if (s === "publishing") return <Chip label="Publishing" color="primary" size="small" />;
  if (s === "failed") return <Chip label="Failed" color="error" size="small" />;
  if (s === "queued") return <Chip label="Queued" color="secondary" size="small" />;
  return <Chip label="Scheduled" color="info" size="small" />;
}

function jobTitle(job) {
  return (
    job.title ||
    job.name ||
    job.summary ||
    job.postTitle ||
    `${job.platform ? `${job.platform} • ` : ""}${job.action || "Publish"}`
  );
}

function jobId(job) {
  return job.id || job._id || job.jobId;
}

export default function QueuePage() {
  const [jobs, setJobs] = useState([]);
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobsError, setJobsError] = useState("");
  const [filter, setFilter] = useState("all");

  const wsRef = useRef(null);
  const pingRef = useRef(null);
  const reconnectRef = useRef(null);
  const reconnectAttemptRef = useRef(0);
  const stoppedRef = useRef(false);

  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true);
    setJobsError("");

    try {
      const { workspaceId } = getAuth();

      const res = await axios.get(JOBS_ENDPOINT, {
        params: {
          limit: 50,
          ...(workspaceId ? { workspaceId } : {}),
        },
      });

      const data = res.data;
      const list = Array.isArray(data) ? data : Array.isArray(data?.jobs) ? data.jobs : [];
      setJobs(list);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load jobs";
      setJobsError(String(msg));
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const safeClose = () => {
    try {
      if (pingRef.current) {
        window.clearInterval(pingRef.current);
        pingRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    } catch {}
  };

  const scheduleReconnect = useCallback(() => {
    if (stoppedRef.current) return;
    if (reconnectRef.current) return;

    reconnectAttemptRef.current += 1;
    const attempt = reconnectAttemptRef.current;

    // exponential backoff (capped)
    const delay = Math.min(15000, 750 * Math.pow(1.6, attempt));

    reconnectRef.current = window.setTimeout(() => {
      reconnectRef.current = null;
      connectWS();
    }, delay);
  }, []);

  const connectWS = useCallback(() => {
    const { token, workspaceId } = getAuth();

    // If not authenticated yet, keep UI usable but don't connect
    if (!token || !workspaceId) {
      setConnected(false);
      setEvents((prev) =>
        [
          {
            type: "notice",
            message: "Missing token/workspaceId. WS disabled until login.",
            ts: new Date().toISOString(),
          },
          ...prev,
        ].slice(0, 50)
      );
      return;
    }

    // reset current
    safeClose();

    let ws;
    try {
      ws = new WebSocket(WS_ENDPOINT);
    } catch (e) {
      setConnected(false);
      scheduleReconnect();
      return;
    }

    wsRef.current = ws;

    ws.onopen = () => {
      // first-message auth (browser compatible)
      ws.send(JSON.stringify({ type: "auth", token, workspaceId }));

      // keepalive ping (optional)
      pingRef.current = window.setInterval(() => {
        try {
          ws.send("ping");
        } catch {}
      }, 25000);
    };

    ws.onmessage = (evt) => {
      let payload;
      try {
        payload = JSON.parse(evt.data);
      } catch {
        payload = { raw: evt.data };
      }

      // hello handshake
      if ((payload?.type || "").toLowerCase() === "hello") {
        setConnected(true);
        reconnectAttemptRef.current = 0; // ✅ reset backoff after successful auth/hello
      }

      // auth errors (4401/4403 won’t show as code in browser reliably),
      // but we can detect server-sent error types if you add them later.
      if ((payload?.type || "").toLowerCase() === "error") {
        setConnected(false);
      }

      setEvents((prev) => [payload, ...prev].slice(0, 50));

      // If job payload, merge into jobs list
      const maybeJob = payload?.job || payload?.data?.job || payload?.data || null;
      if (maybeJob && (maybeJob.id || maybeJob._id || maybeJob.jobId)) {
        const id = jobId(maybeJob);
        setJobs((prev) => {
          const idx = prev.findIndex((j) => jobId(j) === id);
          if (idx === -1) return [maybeJob, ...prev].slice(0, 200);
          const next = [...prev];
          next[idx] = { ...next[idx], ...maybeJob };
          return next;
        });
      }

      // If batch created, refresh jobs list shortly
      const t = String(payload?.type || "").toLowerCase();
      if (t.includes("batch") || t.includes("jobs_created") || t.includes("job.created")) {
        setTimeout(() => fetchJobs(), 250);
      }
    };

    ws.onerror = () => {
      setConnected(false);
      scheduleReconnect();
    };

    ws.onclose = () => {
      setConnected(false);
      scheduleReconnect();
      safeClose();
    };
  }, [fetchJobs, scheduleReconnect]);

  useEffect(() => {
    stoppedRef.current = false;
    connectWS();

    return () => {
      stoppedRef.current = true;
      if (reconnectRef.current) {
        window.clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
      safeClose();
    };
  }, [connectWS]);

  const filteredJobs = useMemo(() => {
    if (filter === "all") return jobs;
    return jobs.filter((j) => normalizeStatus(j.status) === filter);
  }, [jobs, filter]);

  const counts = useMemo(() => {
    const base = { all: jobs.length, queued: 0, scheduled: 0, publishing: 0, posted: 0, failed: 0 };
    for (const j of jobs) {
      const s = normalizeStatus(j.status);
      if (base[s] !== undefined) base[s] += 1;
    }
    return base;
  }, [jobs]);

  const retryFailed = async () => {
    try {
      await axios.post(`${BACKEND}/api/v1/jobs/retry-failed`);
      await fetchJobs();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Retry failed endpoint not available yet";
      setJobsError(String(msg));
    }
  };

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          Queue
        </Typography>
        <Typography sx={{ opacity: 0.75 }}>
          The “trust layer”: queued → scheduled → publishing → posted, with retries & fixes.
        </Typography>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap", gap: 1 }}>
            <Chip
              label={connected ? "Live (WS Connected)" : "Offline (WS Disconnected)"}
              color={connected ? "success" : "warning"}
              size="small"
            />
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              {WS_ENDPOINT === "ws://localhost:7002/api/v1/ws" ? null : `WS: ${WS_ENDPOINT}`}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Button variant="outlined" onClick={() => setEvents([])}>
              Clear Events
            </Button>
            <Button variant="outlined" onClick={fetchJobs} disabled={loadingJobs}>
              {loadingJobs ? "Refreshing..." : "Refresh Jobs"}
            </Button>
            <Button variant="contained" onClick={retryFailed} disabled={counts.failed === 0}>
              Retry Failed
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
          <Typography sx={{ fontWeight: 800 }}>Jobs</Typography>

          <ToggleButtonGroup
            exclusive
            value={filter}
            onChange={(_, val) => val && setFilter(val)}
            size="small"
            sx={{ ml: { sm: 2 } }}
          >
            <ToggleButton value="all">All ({counts.all})</ToggleButton>
            <ToggleButton value="queued">Queued ({counts.queued})</ToggleButton>
            <ToggleButton value="scheduled">Scheduled ({counts.scheduled})</ToggleButton>
            <ToggleButton value="publishing">Publishing ({counts.publishing})</ToggleButton>
            <ToggleButton value="posted">Posted ({counts.posted})</ToggleButton>
            <ToggleButton value="failed">Failed ({counts.failed})</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {jobsError ? <Typography sx={{ mt: 1.5, color: "error.main" }}>{jobsError}</Typography> : null}

        <Stack spacing={1} sx={{ mt: 2, mb: 2 }}>
          {filteredJobs.length === 0 ? (
            <Typography sx={{ opacity: 0.7 }}>
              No jobs to show{filter !== "all" ? ` for filter: ${filter}` : ""}.
            </Typography>
          ) : (
            filteredJobs.map((j) => (
              <Paper key={jobId(j)} variant="outlined" sx={{ p: 1.5 }}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800 }} noWrap>
                      {jobTitle(j)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      Job ID: {jobId(j)}
                      {j.platform ? ` • Platform: ${j.platform}` : ""}
                      {j.scheduledAt ? ` • Scheduled: ${new Date(j.scheduledAt).toLocaleString()}` : ""}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} alignItems="center">
                    {statusChip(j.status)}
                    <Button size="small" variant="outlined" onClick={() => alert(JSON.stringify(j, null, 2))}>
                      Details
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            ))
          )}
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography sx={{ fontWeight: 800, mb: 1 }}>Live Events (last 50)</Typography>
        {events.length === 0 ? (
          <Typography sx={{ opacity: 0.7 }}>
            No events yet. When publishing emits events, they’ll appear here.
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
