// frontend/src/pages/BatchBoard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
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
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SendIcon from "@mui/icons-material/Send";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const DEFAULT_PLATFORMS = ["instagram", "tiktok", "youtube", "linkedin", "facebook"];

function bytesToMb(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2);
}

/**
 * Very simple grouping:
 * - If filename contains "_" or "-", group by first token (prefix)
 * - else each file becomes its own group
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

  // Convert to structured groups
  return Array.from(groups.entries()).map(([key, files]) => ({
    id: `${key}-${files.length}-${files[0]?.name || "group"}`,
    title: key,
    files,
    caption: "",
    platforms: DEFAULT_PLATFORMS.slice(0, 3), // start with 3 for sane defaults
    scheduledAt: null, // ISO string later
    status: "draft", // draft | scheduled | queued
  }));
}

function nowLocalISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  // yyyy-MM-ddTHH:mm
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function BatchBoard() {
  const [files, setFiles] = useState([]);
  const [groups, setGroups] = useState([]);

  // Batch controls
  const [templateCaption, setTemplateCaption] = useState(
    "🚀 New drop!\n\n• Key takeaway:\n• Why it matters:\n\n#socialflow #content"
  );
  const [startDateTime, setStartDateTime] = useState(nowLocalISO());
  const [cadenceHours,_toggleCadenceHours] = useState(24); // every 24 hours by default
  const [platformPreset, setPlatformPreset] = useState("balanced");

  // Dropzone state
  const dropRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const summary = useMemo(() => {
    const images = files.filter((f) => f.type.startsWith("image/")).length;
    const videos = files.filter((f) => f.type.startsWith("video/")).length;
    const sizeMb = files.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024);
    return { images, videos, total: files.length, sizeMb: sizeMb.toFixed(2) };
  }, [files]);

  useEffect(() => {
    setGroups(groupFiles(files));
  }, [files]);

  const onPick = (e) => {
    const incoming = Array.from(e.target.files || []);
    if (incoming.length === 0) return;
    setFiles((prev) => [...prev, ...incoming]);
  };

  const onDrop = (incomingFiles) => {
    const incoming = Array.from(incomingFiles || []);
    if (incoming.length === 0) return;
    setFiles((prev) => [...prev, ...incoming]);
  };

  const clearAll = () => {
    setFiles([]);
    setGroups([]);
  };

  const removeGroup = (groupId) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const applyCaptionToAll = () => {
    setGroups((prev) => prev.map((g) => ({ ...g, caption: templateCaption })));
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
  };

  const autoSchedule = () => {
    // Spread groups starting from startDateTime with cadenceHours increments
    const base = new Date(startDateTime);
    if (Number.isNaN(base.getTime())) return;

    setGroups((prev) =>
      prev.map((g, idx) => {
        const d = new Date(base.getTime() + idx * cadenceHours * 60 * 60 * 1000);
        return { ...g, scheduledAt: d.toISOString(), status: "scheduled" };
      })
    );
  };

  const dispatchQueue = () => {
    // For now: mark as queued (later: send to backend / jobs)
    setGroups((prev) => prev.map((g) => ({ ...g, status: g.status === "scheduled" ? "queued" : g.status })));
  };

  const validationForGroup = (g) => {
    // Minimal “product-grade hints” (extend later per platform)
    const hasVideo = g.files.some((f) => f.type.startsWith("video/"));
    const hasImage = g.files.some((f) => f.type.startsWith("image/"));
    const issues = [];

    if (!g.platforms?.length) issues.push("No platforms selected");
    if (!g.caption?.trim()) issues.push("No caption");
    if (!g.scheduledAt && g.status !== "draft") issues.push("Missing schedule time");

    // basic: if multiple platforms and only image, warn about TikTok
    if (g.platforms.includes("tiktok") && hasImage && !hasVideo) {
      issues.push("TikTok prefers video (check format)");
    }

    // if group has many files, warn to confirm carousel limits later
    if (hasImage && g.files.length > 10) {
      issues.push("High image count (platform carousel limits differ)");
    }

    return issues;
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

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          Batch Board
        </Typography>
        <Typography sx={{ opacity: 0.8 }}>
          Upload in bulk → auto-group → apply templates → auto-schedule → dispatch.
        </Typography>
      </Box>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={2} alignItems="stretch">
        {/* LEFT: Drop + Groups */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Paper
            ref={dropRef}
            sx={{
              p: 2,
              border: "1px dashed",
              borderColor: isDragging ? "primary.main" : "divider",
              background:
                isDragging ? "rgba(139,92,246,0.08)" : "transparent",
              transition: "all 160ms ease",
            }}
          >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" justifyContent="space-between">
              <Box>
                <Typography sx={{ fontWeight: 900 }}>Batch Upload</Typography>
                <Typography variant="body2" sx={{ opacity: 0.75 }}>
                  {summary.total} files • {summary.images} images • {summary.videos} videos • {summary.sizeMb} MB
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.6 }}>
                  Tip: drag a whole folder in. SocialFlow will group by filename prefix.
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                <Button variant="contained" startIcon={<CloudUploadIcon />} component="label">
                  Select files
                  <input hidden multiple type="file" accept="image/*,video/*" onChange={onPick} />
                </Button>

                <Tooltip title="Clear batch">
                  <span>
                    <IconButton onClick={clearAll} disabled={files.length === 0}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            </Stack>
          </Paper>

          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography sx={{ fontWeight: 900, mb: 1 }}>
              Post Candidates ({groups.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {groups.length === 0 ? (
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
                      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }} justifyContent="space-between">
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 900 }} noWrap>
                            {g.title}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.7 }}>
                            {g.files.length} file(s) •{" "}
                            {g.files.slice(0, 3).map((f) => f.name).join(", ")}
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
                              <Chip size="small" label={`Scheduled`} color="success" />
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
                              // quick single schedule
                              const d = new Date();
                              d.setHours(d.getHours() + 1);
                              setGroups((prev) =>
                                prev.map((x) =>
                                  x.id === g.id ? { ...x, scheduledAt: d.toISOString(), status: "scheduled" } : x
                                )
                              );
                            }}
                            startIcon={<ScheduleIcon />}
                          >
                            Quick schedule
                          </Button>

                          <Tooltip title="Remove candidate">
                            <IconButton onClick={() => removeGroup(g.id)}>
                              <DeleteOutlineIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>

                      <Divider sx={{ my: 1.5 }} />

                      <Stack spacing={1.25}>
                        <TextField
                          label="Caption (applies per post candidate)"
                          value={g.caption}
                          onChange={(e) =>
                            setGroups((prev) =>
                              prev.map((x) => (x.id === g.id ? { ...x, caption: e.target.value } : x))
                            )
                          }
                          multiline
                          minRows={2}
                        />

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                          <FormControl size="small" sx={{ minWidth: 240 }}>
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
              />

              <Button
                variant="outlined"
                startIcon={<AutoAwesomeIcon />}
                disabled={groups.length === 0}
                onClick={applyCaptionToAll}
              >
                Apply caption to all
              </Button>

              <FormControl size="small">
                <InputLabel>Platform Preset</InputLabel>
                <Select
                  label="Platform Preset"
                  value={platformPreset}
                  onChange={(e) => setPlatformPreset(e.target.value)}
                >
                  <MenuItem value="balanced">Balanced (IG + TikTok + YouTube)</MenuItem>
                  <MenuItem value="business">Business (LinkedIn + FB + IG)</MenuItem>
                  <MenuItem value="all">All Platforms</MenuItem>
                </Select>
              </FormControl>

              <Button variant="outlined" disabled={groups.length === 0} onClick={applyPlatformPreset}>
                Apply platform preset to all
              </Button>

              <Divider />

              <TextField
                label="Start date/time"
                type="datetime-local"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />

              <Box>
                <Typography variant="body2" sx={{ opacity: 0.75, mb: 1 }}>
                  Cadence (hours between posts)
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  value={cadenceHours}
                  onChange={(_, val) => val && _toggleCadenceHours(val)}
                  size="small"
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
                disabled={groups.length === 0}
                onClick={autoSchedule}
              >
                Auto-schedule batch
              </Button>

              <Divider />

              <Button
                variant="contained"
                color="primary"
                startIcon={<SendIcon />}
                disabled={groups.length === 0}
                onClick={dispatchQueue}
              >
                Dispatch to queue
              </Button>

              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Next: dispatch will POST to backend, create publish jobs, and stream status via SSE.
              </Typography>
            </Stack>
          </Paper>
        </Box>
      </Stack>
    </Stack>
  );
}
