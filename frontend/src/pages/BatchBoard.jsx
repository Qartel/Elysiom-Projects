// frontend/src/pages/BatchBoard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Divider,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  LinearProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SendIcon from "@mui/icons-material/Send";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FolderZipIcon from "@mui/icons-material/FolderZip";
import { useNavigate } from "react-router-dom";

import { getAuth } from "../api/client";

const DEFAULT_PLATFORMS = ["instagram", "tiktok", "youtube", "linkedin", "facebook"];

const BACKEND =
  process.env.REACT_APP_BACKEND_URL ||
  process.env.REACT_APP_API_BASE

// Legacy endpoint (kept)
const LEGACY_BATCH_ENDPOINT = `${BACKEND}/api/v1/batch`;

// Enterprise endpoint (preferred)
const ZIP_UPLOAD_ENDPOINT = `${BACKEND}/api/v1/batches/upload-zip`;

function bytesToMb(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2);
}

/**
 * Very simple grouping:
 * - If filename contains "_" or "-", group by first token (prefix)
 * - else group by filename (without extension)
 * Example: "reel_01.mp4", "reel_02.mp4" -> group "reel"
 */
function groupFiles(files) {
  const groups = new Map();

  for (const f of files) {
    const name = (f.name || "").toLowerCase();
    const token = name.includes("_")
      ? name.split("_")[0]
      : name.includes("-")
      ? name.split("-")[0]
      : name.replace(/\.[^/.]+$/, ""); // name without extension

    const key = token && token.length >= 3 ? token : name;

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(f);
  }

  return Array.from(groups.entries()).map(([key, groupedFiles]) => ({
    id: `${key}-${groupedFiles.length}-${groupedFiles[0]?.name || "group"}`,
    title: key,
    files: groupedFiles,
    caption: "",
    platforms: DEFAULT_PLATFORMS.slice(0, 3), // sane defaults
    scheduledAt: null, // ISO string
    status: "draft", // draft | scheduled | queued
  }));
}

function nowLocalISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  // yyyy-MM-ddTHH:mm
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function toPolicyFromUI({ startDateTime, cadenceHours }) {
  // For now, cadenceHours maps to a single "timesOfDay" slot + repeating days policy later.
  // We keep it minimal and stable: service can interpret this policy.
  return {
    startAt: new Date(startDateTime).toISOString(),
    cadenceHours: cadenceHours,
    // optional placeholders for later weekly slots:
    daysOfWeek: [1, 3, 5, 0],
    timesOfDay: ["09:00"],
  };
}

export default function BatchBoard() {
  const navigate = useNavigate();

  // Asset modes
  const [zipFile, setZipFile] = useState(null); // enterprise path
  const [files, setFiles] = useState([]); // legacy path
  const [groups, setGroups] = useState([]);

  // Batch controls
  const [templateCaption, setTemplateCaption] = useState(
    "🚀 New drop!\n\n• Key takeaway:\n• Why it matters:\n\n#socialflow #content"
  );
  const [startDateTime, setStartDateTime] = useState(nowLocalISO());
  const [cadenceHours, setCadenceHours] = useState(24);
  const [platformPreset, setPlatformPreset] = useState("balanced");

  // Dropzone state
  const dropRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Dispatch / API
  const [dispatching, setDispatching] = useState(false);
  const [apiError, setApiError] = useState("");
  const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });

  // Confirm modal (enterprise UX)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmScheduleAll, setConfirmScheduleAll] = useState(true);
  const [confirmCreateJobs, setConfirmCreateJobs] = useState(true);

  // Minimal progress indicator for ZIP ingest
  const [zipProgress, setZipProgress] = useState({ active: false, pct: 0, label: "" });

  const summary = useMemo(() => {
    const images = files.filter((f) => f.type?.startsWith("image/")).length;
    const videos = files.filter((f) => f.type?.startsWith("video/")).length;
    const sizeMb = files.reduce((acc, f) => acc + (f.size || 0), 0) / (1024 * 1024);
    return { images, videos, total: files.length, sizeMb: sizeMb.toFixed(2) };
  }, [files]);

  useEffect(() => {
    // Only auto-group in legacy mode (when we have normal files)
    setGroups(groupFiles(files));
  }, [files]);

  const onPick = (e) => {
    const incoming = Array.from(e.target.files || []);
    if (incoming.length === 0) return;
    setZipFile(null); // switching modes
    setFiles((prev) => [...prev, ...incoming]);
  };

  const onPickZip = (e) => {
    const f = e.target.files?.[0] || null;
    if (!f) return;
    if (!String(f.name || "").toLowerCase().endsWith(".zip")) {
      setToast({ open: true, msg: "Please select a .zip file.", severity: "error" });
      return;
    }
    // switching modes
    setFiles([]);
    setGroups([]);
    setZipFile(f);
    setToast({ open: true, msg: `ZIP selected: ${f.name}`, severity: "success" });
  };

  const onDrop = (incomingFiles) => {
    const incoming = Array.from(incomingFiles || []);
    if (incoming.length === 0) return;

    // If a single zip was dropped, treat as zip mode
    if (incoming.length === 1 && String(incoming[0]?.name || "").toLowerCase().endsWith(".zip")) {
      setFiles([]);
      setGroups([]);
      setZipFile(incoming[0]);
      setToast({ open: true, msg: `ZIP selected: ${incoming[0].name}`, severity: "success" });
      return;
    }

    setZipFile(null); // switching to legacy mode
    setFiles((prev) => [...prev, ...incoming]);
  };

  const clearAll = () => {
    setZipFile(null);
    setFiles([]);
    setGroups([]);
  };

  const removeGroup = (groupId) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const applyCaptionToAll = () => {
    setGroups((prev) => prev.map((g) => ({ ...g, caption: templateCaption })));
    setToast({ open: true, msg: "Caption applied to all candidates.", severity: "success" });
  };

  const applyPlatformPreset = () => {
    const presetToPlatforms = (preset) => {
      if (preset === "balanced") return ["instagram", "tiktok", "youtube"];
      if (preset === "business") return ["linkedin", "facebook", "instagram"];
      if (preset === "all") return DEFAULT_PLATFORMS;
      return ["instagram", "tiktok", "youtube"];
    };

    const next = presetToPlatforms(platformPreset);
    setGroups((prev) => prev.map((g) => ({ ...g, platforms: next })));
    setToast({ open: true, msg: "Platform preset applied to all candidates.", severity: "success" });
  };

  const autoSchedule = () => {
    const base = new Date(startDateTime);
    if (Number.isNaN(base.getTime())) {
      setToast({ open: true, msg: "Invalid start date/time.", severity: "error" });
      return;
    }

    setGroups((prev) =>
      prev.map((g, idx) => {
        const d = new Date(base.getTime() + idx * cadenceHours * 60 * 60 * 1000);
        return { ...g, scheduledAt: d.toISOString(), status: "scheduled" };
      })
    );

    setToast({ open: true, msg: "Auto-schedule applied.", severity: "success" });
  };

  const validationForGroup = (g) => {
    const hasVideo = g.files.some((f) => f.type?.startsWith("video/"));
    const hasImage = g.files.some((f) => f.type?.startsWith("image/"));
    const issues = [];

    if (!g.platforms?.length) issues.push("No platforms selected");
    if (!g.caption?.trim()) issues.push("No caption");
    if (!g.scheduledAt && g.status !== "draft") issues.push("Missing schedule time");

    if (g.platforms.includes("tiktok") && hasImage && !hasVideo) {
      issues.push("TikTok prefers video (check format)");
    }

    if (hasImage && g.files.length > 10) {
      issues.push("High image count (platform carousel limits differ)");
    }

    return issues;
  };

  // --------------------------------------------
  // Enterprise path: ZIP upload + confirm modal
  // --------------------------------------------
  const openConfirm = () => {
    if (!zipFile && groups.length === 0) {
      setToast({ open: true, msg: "Add a ZIP or upload files first.", severity: "warning" });
      return;
    }
    setConfirmOpen(true);
  };

  const dispatchZip = async () => {
    setApiError("");
    setDispatching(true);
    setZipProgress({ active: true, pct: 10, label: "Uploading ZIP…" });

    try {
      const { workspaceId } = getAuth();
      if (!workspaceId) {
        throw new Error("Missing workspaceId (X-Workspace-Id). Please login first.");
      }

      if (!zipFile) {
        throw new Error("No ZIP selected.");
      }

      const policy = toPolicyFromUI({ startDateTime, cadenceHours });

      const form = new FormData();
      form.append("file", zipFile);

      // We pass options as JSON via a form field.
      // Backend receives it as BatchUploadOptions (Pydantic) if you accept it.
      form.append(
        "options",
        JSON.stringify({
          scheduleAll: confirmScheduleAll,
          createJobs: confirmCreateJobs,
          policy,
        })
      );

      setZipProgress({ active: true, pct: 35, label: "Processing ZIP…" });

      const res = await axios.post(ZIP_UPLOAD_ENDPOINT, form, {
        headers: {
          "Content-Type": "multipart/form-data",
          // axios interceptor adds Authorization + X-Workspace-Id, but keep explicit safe:
          ...(workspaceId ? { "X-Workspace-Id": workspaceId } : {}),
        },
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          const pct = Math.max(10, Math.min(90, Math.round((evt.loaded / evt.total) * 60) + 10));
          setZipProgress({ active: true, pct, label: "Uploading ZIP…" });
        },
      });

      setZipProgress({ active: true, pct: 100, label: "Done" });

      const batchId = res.data?.batchId || res.data?.batch?._id || "batch";
      const jobsCreated = res.data?.jobsCreated ?? res.data?.jobCount ?? res.data?.jobs?.length ?? 0;

      setToast({
        open: true,
        msg: `ZIP ingested. Batch: ${batchId}. Jobs created: ${jobsCreated}. Redirecting to Queue…`,
        severity: "success",
      });

      // Reset UI after successful dispatch
      setConfirmOpen(false);
      setZipFile(null);
      setFiles([]);
      setGroups([]);

      setTimeout(() => navigate("/queue"), 700);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to upload ZIP";
      setApiError(String(msg));
      setToast({ open: true, msg: `Upload failed: ${msg}`, severity: "error" });
    } finally {
      setDispatching(false);
      setTimeout(() => setZipProgress({ active: false, pct: 0, label: "" }), 600);
    }
  };

  // --------------------------------------------
  // Legacy path: JSON groups -> /batch
  // --------------------------------------------
  const dispatchLegacyGroups = async () => {
    setApiError("");
    setDispatching(true);

    try {
      // Keep payload minimal. Tenant scoping should come from header.
      const payload = {
        groups: groups.map((g) => ({
          title: g.title,
          caption: g.caption,
          platforms: g.platforms,
          scheduledAt: g.scheduledAt,
          files: (g.files || []).map((f) => ({
            name: f.name,
            type: f.type,
            size: f.size,
          })),
        })),
      };

      const res = await axios.post(LEGACY_BATCH_ENDPOINT, payload);

      setGroups((prev) =>
        prev.map((g) => ({
          ...g,
          status: g.status === "scheduled" ? "queued" : g.status,
        }))
      );

      setToast({
        open: true,
        msg: `Batch created (${res.data?.jobs?.length ?? 0} jobs). Redirecting to Queue…`,
        severity: "success",
      });

      setTimeout(() => navigate("/queue"), 600);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to dispatch batch";
      setApiError(String(msg));
      setToast({ open: true, msg: `Dispatch failed: ${msg}`, severity: "error" });
    } finally {
      setDispatching(false);
    }
  };

  // Setup drop events on container
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;

    const onDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const onDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const onDropEvt = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      onDrop(e.dataTransfer.files);
    };

    el.addEventListener("dragover", onDragOver);
    el.addEventListener("dragleave", onDragLeave);
    el.addEventListener("drop", onDropEvt);

    return () => {
      el.removeEventListener("dragover", onDragOver);
      el.removeEventListener("dragleave", onDragLeave);
      el.removeEventListener("drop", onDropEvt);
    };
  }, []);

  const modeLabel = zipFile ? "ZIP Mode" : "File Mode";

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          Batch Board
        </Typography>
        <Typography sx={{ opacity: 0.8 }}>
          Upload in bulk → auto-group → apply templates → schedule → dispatch.
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", gap: 1 }} alignItems="center">
          <Chip size="small" label={modeLabel} color={zipFile ? "info" : "default"} />
          {zipFile ? (
            <Chip
              size="small"
              variant="outlined"
              icon={<FolderZipIcon />}
              label={`${zipFile.name} • ${bytesToMb(zipFile.size)} MB`}
            />
          ) : (
            <Chip size="small" variant="outlined" label={`${summary.total} files • ${summary.sizeMb} MB`} />
          )}
        </Stack>
        <Typography variant="body2" sx={{ opacity: 0.65, mt: 0.5 }}>
          Backend: {BACKEND}
        </Typography>
      </Box>

      {apiError ? (
        <Alert severity="error">
          {apiError}
          <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
            Tip: ensure backend has <b>POST /api/v1/batches/upload-zip</b> (enterprise) or <b>POST /api/v1/batch</b>{" "}
            (legacy).
          </Typography>
        </Alert>
      ) : null}

      {zipProgress.active ? (
        <Paper sx={{ p: 1.5 }}>
          <Stack spacing={1}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {zipProgress.label}
            </Typography>
            <LinearProgress variant="determinate" value={zipProgress.pct} />
          </Stack>
        </Paper>
      ) : null}

      <Stack direction={{ xs: "column", lg: "row" }} spacing={2} alignItems="stretch">
        {/* LEFT: Drop + Groups */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Paper
            ref={dropRef}
            sx={{
              p: 2,
              border: "1px dashed",
              borderColor: isDragging ? "primary.main" : "divider",
              background: isDragging ? "rgba(139,92,246,0.08)" : "transparent",
              transition: "all 160ms ease",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography sx={{ fontWeight: 900 }}>Batch Upload</Typography>
                <Typography variant="body2" sx={{ opacity: 0.75 }}>
                  {zipFile
                    ? `ZIP selected • ${bytesToMb(zipFile.size)} MB`
                    : `${summary.total} files • ${summary.images} images • ${summary.videos} videos • ${summary.sizeMb} MB`}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.6 }}>
                  Tip: drop a ZIP to use enterprise ingest (ordered filenames). Drop files to use quick grouping.
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  startIcon={<FolderZipIcon />}
                  component="label"
                  disabled={dispatching}
                >
                  Select ZIP
                  <input hidden type="file" accept=".zip" onChange={onPickZip} />
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  component="label"
                  disabled={dispatching}
                >
                  Select files
                  <input hidden multiple type="file" accept="image/*,video/*" onChange={onPick} />
                </Button>

                <Tooltip title="Clear batch">
                  <span>
                    <IconButton onClick={clearAll} disabled={(files.length === 0 && !zipFile) || dispatching}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            </Stack>
          </Paper>

          <Paper sx={{ p: 2, mt: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography sx={{ fontWeight: 900 }}>
                Post Candidates ({zipFile ? "ZIP creates candidates server-side" : groups.length})
              </Typography>

              <Button
                size="small"
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={applyCaptionToAll}
                disabled={zipFile || groups.length === 0 || dispatching}
              >
                Apply caption to all
              </Button>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            {zipFile ? (
              <Typography sx={{ opacity: 0.7 }}>
                ZIP mode: candidates are created server-side (ordered filenames → grouped posts → optional schedule spillover).
                Click <b>Dispatch</b> to ingest.
              </Typography>
            ) : groups.length === 0 ? (
              <Typography sx={{ opacity: 0.7 }}>
                No assets yet. Upload a batch to see auto-created post candidates.
              </Typography>
            ) : (
              <Stack spacing={1.25}>
                {groups.map((g) => {
                  const issues = validationForGroup(g);
                  const hasIssues = issues.length > 0;

                  return (
                    <Paper key={g.id} variant="outlined" sx={{ p: 1.5 }}>
                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={1.5}
                        alignItems={{ md: "center" }}
                        justifyContent="space-between"
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 900 }} noWrap>
                            {g.title}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.7 }}>
                            {g.files.length} file(s) • {g.files.slice(0, 3).map((f) => f.name).join(", ")}
                            {g.files.length > 3 ? "…" : ""}
                          </Typography>

                          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", gap: 1 }}>
                            <Chip
                              size="small"
                              label={g.status.toUpperCase()}
                              color={g.status === "queued" ? "primary" : g.status === "scheduled" ? "info" : "default"}
                            />
                            <Chip size="small" label={`${g.platforms.length} platforms`} />
                            {g.scheduledAt ? (
                              <Chip size="small" label="Scheduled" color="success" />
                            ) : (
                              <Chip size="small" label="Not scheduled" />
                            )}
                            {hasIssues ? (
                              <Chip size="small" label={`${issues.length} issue(s)`} color="warning" />
                            ) : (
                              <Chip size="small" label="Ready" color="success" />
                            )}
                          </Stack>

                          {hasIssues && (
                            <Typography variant="body2" sx={{ mt: 1, opacity: 0.75 }}>
                              ⚠ {issues.join(" • ")}
                            </Typography>
                          )}
                        </Box>

                        <Stack direction="row" spacing={1} alignItems="center">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              const d = new Date();
                              d.setHours(d.getHours() + 1);
                              setGroups((prev) =>
                                prev.map((x) =>
                                  x.id === g.id ? { ...x, scheduledAt: d.toISOString(), status: "scheduled" } : x
                                )
                              );
                            }}
                            startIcon={<ScheduleIcon />}
                            disabled={dispatching}
                          >
                            Quick schedule
                          </Button>

                          <Tooltip title="Remove candidate">
                            <span>
                              <IconButton onClick={() => removeGroup(g.id)} disabled={dispatching}>
                                <DeleteOutlineIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </Stack>

                      <Divider sx={{ my: 1.5 }} />

                      <Stack spacing={1.25}>
                        <TextField
                          label="Caption (per post candidate)"
                          value={g.caption}
                          onChange={(e) =>
                            setGroups((prev) => prev.map((x) => (x.id === g.id ? { ...x, caption: e.target.value } : x)))
                          }
                          multiline
                          minRows={2}
                          disabled={dispatching}
                        />

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                          <FormControl size="small" sx={{ minWidth: 240 }} disabled={dispatching}>
                            <InputLabel>Platforms</InputLabel>
                            <Select
                              label="Platforms"
                              multiple
                              value={g.platforms}
                              onChange={(e) =>
                                setGroups((prev) =>
                                  prev.map((x) => (x.id === g.id ? { ...x, platforms: e.target.value } : x))
                                )
                              }
                              renderValue={(selected) => selected.join(", ")}
                            >
                              {DEFAULT_PLATFORMS.map((p) => (
                                <MenuItem key={p} value={p}>
                                  {p}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <TextField
                            size="small"
                            label="Scheduled At (ISO)"
                            value={g.scheduledAt || ""}
                            placeholder="(auto-schedule recommended)"
                            onChange={(e) =>
                              setGroups((prev) =>
                                prev.map((x) => (x.id === g.id ? { ...x, scheduledAt: e.target.value } : x))
                              )
                            }
                            sx={{ flex: 1 }}
                            disabled={dispatching}
                          />
                        </Stack>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Box>

        {/* RIGHT: Batch Actions */}
        <Box sx={{ width: { xs: "100%", lg: 420 } }}>
          <Paper sx={{ p: 2, position: { lg: "sticky" }, top: { lg: 88 } }}>
            <Typography sx={{ fontWeight: 900, mb: 1 }}>Batch Actions</Typography>
            <Typography variant="body2" sx={{ opacity: 0.75, mb: 2 }}>
              This panel is the product’s “speed advantage”.
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1.5}>
              <TextField
                label="Template Caption (apply to all)"
                value={templateCaption}
                onChange={(e) => setTemplateCaption(e.target.value)}
                multiline
                minRows={3}
                disabled={dispatching || !!zipFile}
                helperText={zipFile ? "ZIP mode: captions are handled server-side per candidate (next step)." : " "}
              />

              <Button
                variant="outlined"
                startIcon={<AutoAwesomeIcon />}
                disabled={zipFile || groups.length === 0 || dispatching}
                onClick={applyCaptionToAll}
              >
                Apply caption to all
              </Button>

              <FormControl size="small" disabled={dispatching}>
                <InputLabel>Platform Preset</InputLabel>
                <Select label="Platform Preset" value={platformPreset} onChange={(e) => setPlatformPreset(e.target.value)}>
                  <MenuItem value="balanced">Balanced (IG + TikTok + YouTube)</MenuItem>
                  <MenuItem value="business">Business (LinkedIn + FB + IG)</MenuItem>
                  <MenuItem value="all">All Platforms</MenuItem>
                </Select>
              </FormControl>

              <Button variant="outlined" disabled={zipFile ? false : groups.length === 0 || dispatching} onClick={applyPlatformPreset}>
                Apply platform preset to all
              </Button>

              <Divider />

              <TextField
                label="Start date/time"
                type="datetime-local"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={dispatching}
              />

              <Box>
                <Typography variant="body2" sx={{ opacity: 0.75, mb: 1 }}>
                  Cadence (hours between posts)
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  value={cadenceHours}
                  onChange={(_, val) => val && setCadenceHours(val)}
                  size="small"
                  disabled={dispatching}
                >
                  <ToggleButton value={1}>1h</ToggleButton>
                  <ToggleButton value={3}>3h</ToggleButton>
                  <ToggleButton value={6}>6h</ToggleButton>
                  <ToggleButton value={24}>24h</ToggleButton>
                  <ToggleButton value={48}>48h</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Button
                variant="contained"
                startIcon={<ScheduleIcon />}
                disabled={zipFile || groups.length === 0 || dispatching}
                onClick={autoSchedule}
              >
                Auto-schedule batch
              </Button>

              <Divider />

              <Button
                variant="contained"
                color="primary"
                startIcon={<SendIcon />}
                disabled={dispatching || (!zipFile && groups.length === 0) || (zipFile && !zipFile)}
                onClick={zipFile ? openConfirm : dispatchLegacyGroups}
              >
                {dispatching ? "Dispatching..." : zipFile ? "Ingest ZIP (enterprise)" : "Dispatch to queue"}
              </Button>

              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {zipFile ? (
                  <>
                    Enterprise ingest: uploads ZIP to <b>/api/v1/batches/upload-zip</b>, creates candidates/jobs, Queue updates via WS.
                  </>
                ) : (
                  <>
                    Legacy: dispatch POSTs to <b>/api/v1/batch</b>, creates jobs in Mongo, Queue updates via WS.
                  </>
                )}
              </Typography>
            </Stack>
          </Paper>
        </Box>
      </Stack>

      {/* Confirm modal for enterprise scheduling */}
      <Dialog open={confirmOpen} onClose={() => (dispatching ? null : setConfirmOpen(false))} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 900 }}>Ingest ZIP</DialogTitle>
        <DialogContent>
          <Typography sx={{ opacity: 0.8 }}>
            Your ZIP will be parsed into ordered candidates (e.g. <b>001_instagram_post</b>, <b>002_fb_reel</b>) with spillover scheduling.
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1.5}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={confirmScheduleAll}
                  onChange={(e) => setConfirmScheduleAll(e.target.checked)}
                  disabled={dispatching}
                />
              }
              label="Schedule all candidates automatically"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={confirmCreateJobs}
                  onChange={(e) => setConfirmCreateJobs(e.target.checked)}
                  disabled={dispatching}
                />
              }
              label="Create publish jobs immediately"
            />

            <Typography variant="body2" sx={{ opacity: 0.75 }}>
              Policy used:
              <br />
              • Start: <b>{startDateTime}</b>
              <br />
              • Cadence: <b>{cadenceHours} hours</b>
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={dispatching}>
            Cancel
          </Button>
          <Button variant="contained" onClick={dispatchZip} disabled={dispatching}>
            {dispatching ? "Ingesting..." : "Confirm & Ingest"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={2800}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
