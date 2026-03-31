import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "KnowYourPew Spiritual Gifts Assessment";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#172554",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 8 }}>⛪️</div>
        <div style={{ fontSize: 64, fontWeight: "bold" }}>KnowYourPew</div>
        <div style={{ fontSize: 28, marginTop: 16, color: "#fbbf24" }}>
          Discover Your Spiritual Gifts
        </div>
        <div style={{ fontSize: 22, marginTop: 12, opacity: 0.8 }}>
          Woodridge Baptist Church
        </div>
      </div>
    ),
    { ...size },
  );
}
