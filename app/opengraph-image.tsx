import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#f97316",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 80px",
          position: "relative",
        }}
      >
        {/* Grade badges */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 80,
            width: 100,
            height: 100,
            borderRadius: 20,
            background: "#10b981",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
            fontWeight: 900,
            color: "white",
            opacity: 0.9,
          }}
        >
          A
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 80,
            width: 100,
            height: 100,
            borderRadius: 20,
            background: "#ef4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
            fontWeight: 900,
            color: "white",
            opacity: 0.9,
          }}
        >
          F
        </div>

        {/* Logo */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: "-0.5px",
            marginBottom: 32,
          }}
        >
          GradeMysite
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: "white",
            textAlign: "center",
            lineHeight: 1.05,
            letterSpacing: "-2px",
            maxWidth: 900,
          }}
        >
          Find out why your website isn't getting calls
        </div>

        {/* Subline */}
        <div
          style={{
            fontSize: 26,
            color: "rgba(255,255,255,0.75)",
            marginTop: 28,
            textAlign: "center",
          }}
        >
          Free 30-second scan · Full report from £49
        </div>
      </div>
    ),
    { ...size }
  );
}
