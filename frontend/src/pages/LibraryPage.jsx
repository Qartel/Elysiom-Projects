import React, { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  TextField,
  Chip,
  Grid,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

export default function LibraryPage() {
  const [query, setQuery] = useState("");

  // Demo assets (replace with backend assets later)
  const assets = useMemo(
    () => [
      { id: "a1", name: "reel_teaser_01.mp4", type: "video", tags: ["reel", "promo"] },
      { id: "a2", name: "carousel_slide_01.png", type: "image", tags: ["carousel", "brand"] },
      { id: "a3", name: "product_shot_03.jpg", type: "image", tags: ["product"] },
      { id: "a4", name: "short_cutdown_02.mp4", type: "video", tags: ["short", "repurpose"] },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter((a) => `${a.name} ${a.type} ${a.tags.join(" ")}`.toLowerCase().includes(q));
  }, [assets, query]);

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>Library</Typography>
        <Typography sx={{ opacity: 0.75 }}>
          Your “single source of truth” for all assets — built for batch workflows.
        </Typography>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }} justifyContent="space-between">
          <TextField
            size="small"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assets, tags, file types..."
            sx={{ minWidth: { xs: "100%", sm: 420 } }}
          />
          <Button variant="contained" startIcon={<UploadFileIcon />} component="label">
            Upload Batch
            <input hidden multiple type="file" accept="image/*,video/*" />
          </Button>
        </Stack>

        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {filtered.map((a) => (
            <Grid key={a.id} item xs={12} sm={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
                <Typography sx={{ fontWeight: 800, mb: 0.5 }}>{a.name}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.75, mb: 1 }}>
                  Type: {a.type}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                  {a.tags.map((t) => (
                    <Chip key={t} label={t} size="small" />
                  ))}
                </Stack>

                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button size="small" variant="outlined">Preview</Button>
                  <Button size="small" variant="contained">Use</Button>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Stack>
  );
}
