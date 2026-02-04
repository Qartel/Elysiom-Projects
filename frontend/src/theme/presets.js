// frontend/src/theme/presets.js
import { createTheme } from "@mui/material/styles";

const ACCENTS = {
  purple: { main: "#8B5CF6", glow: "rgba(139,92,246,0.25)" },
  green: { main: "#22C55E", glow: "rgba(34,197,94,0.22)" },
};

// Neutral surfaces (don’t change with accent)
const SURFACES = {
  dark: {
    bg0: "#05060A",
    card: "#0B0F19",
    text: "#EDEBFF",
    text2: "rgba(237,235,255,0.72)",
    border: "rgba(255,255,255,0.08)",
    border2: "rgba(255,255,255,0.12)",
  },
  light: {
    bg0: "#F6F8F7",
    card: "#FFFFFF",
    text: "#0B1A12",
    text2: "rgba(11,26,18,0.72)",
    border: "rgba(0,0,0,0.08)",
    border2: "rgba(0,0,0,0.12)",
  },
};

export function createAppTheme({ mode = "dark", accent = "purple" }) {
  const S = SURFACES[mode] ?? SURFACES.dark;
  const A = ACCENTS[accent] ?? ACCENTS.purple;

  return createTheme({
    shape: { borderRadius: 16 },
    typography: {
      fontFamily: ["Inter", "system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"].join(","),
    },
    palette: {
      mode,
      primary: { main: A.main },
      background: { default: S.bg0, paper: S.card },
      text: { primary: S.text, secondary: S.text2 },
      divider: S.border,
      success: { main: "#22C55E" },
      info: { main: "#60A5FA" },
      warning: { main: "#F59E0B" },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background:
              mode === "dark"
                ? `radial-gradient(900px 500px at 20% 10%, ${A.glow}, transparent 55%),
                   radial-gradient(700px 420px at 80% 0%, rgba(96,165,250,0.10), transparent 60%),
                   ${S.bg0}`
                : S.bg0,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: `1px solid ${S.border}`,
            backgroundColor: S.card,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 900,
            borderRadius: 14,
          },
          containedPrimary: {
            boxShadow:
              mode === "dark"
                ? `0 16px 50px ${A.glow}`
                : `0 12px 40px ${A.glow}`,
          },
          outlined: {
            borderColor: S.border2,
            backgroundColor: mode === "dark" ? "rgba(11,15,25,0.30)" : "rgba(255,255,255,0.75)",
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundColor: mode === "dark" ? "rgba(11,15,25,0.35)" : "rgba(255,255,255,0.85)",
          },
          notchedOutline: { borderColor: S.border2 },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 999, fontWeight: 900 },
          outlined: { borderColor: S.border2 },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: { height: 3, borderRadius: 999 },
        },
      },
    },
  });
}
