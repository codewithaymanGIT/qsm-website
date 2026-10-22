import { ImageResponse } from "next/og";

// The picture shown when a page link is shared on WhatsApp, LinkedIn and similar.
export const alt = "Quality Steel and Metals: tool, die and mould steel since 2002";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0A1A33",
        color: "#F5F8FC",
        padding: "72px 80px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 700,
            color: "#4C9BDF",
            letterSpacing: -2,
          }}
        >
          QSM
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 26,
            letterSpacing: 4,
          }}
        >
          <span>QUALITY STEEL</span>
          <span style={{ color: "#4C9BDF", fontSize: 18, letterSpacing: 10 }}>&amp; METALS</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -2,
          }}
        >
          Tool, die &amp; mould steel.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 32,
            color: "#9DB0CC",
          }}
        >
          Importer and stockist since 2002 · Cutting, machining and grinding in-house
        </div>
      </div>
      <div
        style={{
          display: "flex",
          height: 10,
          width: 360,
          background: "#4C9BDF",
        }}
      />
    </div>,
    size,
  );
}
