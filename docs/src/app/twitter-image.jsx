import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Rybbit - Next-gen Web Analytics";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  // Fetch Inter font
  const interSemiBold = fetch(
    new URL(
      "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2"
    )
  ).then((res) => res.arrayBuffer());

  const interRegular = fetch(
    new URL(
      "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeAZ9hiJ-Ek-_EeA.woff2"
    )
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 25px 25px, #262626 2%, transparent 0%), radial-gradient(circle at 75px 75px, #262626 2%, transparent 0%)",
          backgroundSize: "100px 100px",
          backgroundPosition: "0 0, 50px 50px",
          padding: "80px",
          position: "relative",
        }}
      >
        {/* Logo and brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#22c55e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "24px",
            }}
          >
            <div
              style={{
                color: "white",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            >
              R
            </div>
          </div>
          <div
            style={{
              color: "white",
              fontSize: "40px",
              fontWeight: "600",
              fontFamily: "Inter",
            }}
          >
            rybbit.
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: "700",
            color: "white",
            lineHeight: 1.1,
            marginBottom: "32px",
            fontFamily: "Inter",
            maxWidth: "900px",
          }}
        >
          Next-gen Web Analytics
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: "28px",
            color: "#a3a3a3",
            lineHeight: 1.4,
            maxWidth: "800px",
            fontFamily: "Inter",
            marginBottom: "40px",
          }}
        >
          Open source, lightweight, cookieless web & product analytics for
          everyone — GDPR/CCPA compliant.
        </div>

        {/* Features */}
        <div
          style={{
            display: "flex",
            gap: "32px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "#22c55e",
              fontSize: "18px",
              fontFamily: "Inter",
            }}
          >
            <div style={{ marginRight: "8px" }}>✓</div>
            <div>Open Source</div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "#22c55e",
              fontSize: "18px",
              fontFamily: "Inter",
            }}
          >
            <div style={{ marginRight: "8px" }}>✓</div>
            <div>Cookieless</div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "#22c55e",
              fontSize: "18px",
              fontFamily: "Inter",
            }}
          >
            <div style={{ marginRight: "8px" }}>✓</div>
            <div>GDPR Compliant</div>
          </div>
        </div>

        {/* Twitter branding */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "80px",
            display: "flex",
            alignItems: "center",
            color: "#525252",
            fontSize: "18px",
            fontFamily: "Inter",
          }}
        >
          <div style={{ marginRight: "12px" }}>🐦</div>
          <div>@rybbit_io</div>
        </div>

        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "linear-gradient(45deg, #22c55e20, #1da1f220)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1da1f220, #22c55e20)",
            filter: "blur(80px)",
          }}
        />
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Inter",
          data: await interRegular,
          style: "normal",
          weight: 400,
        },
        {
          name: "Inter",
          data: await interSemiBold,
          style: "normal",
          weight: 600,
        },
      ],
    }
  );
}
