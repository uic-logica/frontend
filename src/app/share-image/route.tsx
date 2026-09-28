import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "100%", height: "100%", background: "#000", color: "#fff", padding: 80 }}>
      <div style={{ fontSize: 88, fontWeight: 700 }}>LOGICA @ UIC</div>
      <div style={{ fontSize: 36, marginTop: 32, maxWidth: 1000 }}>Latinx Organization for Growth in Computing and Academics</div>
      <div style={{ fontSize: 26, marginTop: 48 }}>University of Illinois Chicago</div>
    </div>,
    { width: 1200, height: 630 },
  );
}
