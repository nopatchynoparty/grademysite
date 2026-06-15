import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 7,
          background: "#f97316",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: "-1px",
            lineHeight: 1,
          }}
        >
          G
        </span>
      </div>
    ),
    { ...size }
  );
}
