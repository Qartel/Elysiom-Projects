// frontend/src/components/AuthBackdrop.jsx
import React from "react";
import { Box } from "@mui/material";

export default function AuthBackdrop() {
  return (
    <Box
      aria-hidden
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* soft grid */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.22,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at 50% 25%, black 40%, transparent 75%)",
        }}
      />

      {/* animated blobs */}
      <Box
        sx={{
          position: "absolute",
          width: 520,
          height: 520,
          left: "-10%",
          top: "-10%",
          borderRadius: 999,
          filter: "blur(60px)",
          opacity: 0.35,
          background: "radial-gradient(circle at 30% 30%, rgba(139,92,246,0.55), transparent 60%)",
          animation: "sfFloat1 14s ease-in-out infinite",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 520,
          height: 520,
          right: "-10%",
          top: "-15%",
          borderRadius: 999,
          filter: "blur(60px)",
          opacity: 0.28,
          background: "radial-gradient(circle at 40% 40%, rgba(96,165,250,0.35), transparent 62%)",
          animation: "sfFloat2 18s ease-in-out infinite",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 520,
          height: 520,
          left: "20%",
          bottom: "-25%",
          borderRadius: 999,
          filter: "blur(60px)",
          opacity: 0.22,
          background: "radial-gradient(circle at 40% 40%, rgba(34,197,94,0.25), transparent 62%)",
          animation: "sfFloat3 22s ease-in-out infinite",
        }}
      />

      <style>
        {`
          @keyframes sfFloat1 {
            0%,100% { transform: translate(0,0) scale(1); }
            50% { transform: translate(40px, 35px) scale(1.04); }
          }
          @keyframes sfFloat2 {
            0%,100% { transform: translate(0,0) scale(1); }
            50% { transform: translate(-45px, 30px) scale(1.03); }
          }
          @keyframes sfFloat3 {
            0%,100% { transform: translate(0,0) scale(1); }
            50% { transform: translate(25px, -40px) scale(1.05); }
          }
        `}
      </style>
    </Box>
  );
}
