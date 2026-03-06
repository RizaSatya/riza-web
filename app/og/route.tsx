import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "Riza Satyabudhi";
  const tags = searchParams.get("tags")?.split(",").filter(Boolean) ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#09090b",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            width: "60px",
            height: "4px",
            backgroundColor: "#34d399",
            borderRadius: "2px",
          }}
        />

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div
            style={{
              fontSize: "52px",
              fontWeight: "bold",
              color: "#fafafa",
              lineHeight: 1.2,
              maxWidth: "900px",
            }}
          >
            {title}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div style={{ display: "flex", gap: "8px" }}>
              {tags.slice(0, 4).map((tag) => (
                <div
                  key={tag}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(52, 211, 153, 0.08)",
                    color: "#34d399",
                    fontSize: "16px",
                    fontFamily: "monospace",
                  }}
                >
                  #{tag}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              color: "#71717a",
              fontSize: "20px",
              fontFamily: "monospace",
            }}
          >
            riza.dev
          </div>
          <div style={{ color: "#71717a", fontSize: "16px" }}>
            Riza Satyabudhi
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
