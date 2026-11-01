/** @type {import('next').NextConfig} */
const path = require("path");

const baseSecurityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig = {
  async headers() {
    const cleanHost = (process.env.NEXT_PUBLIC_TOR_ONION_HOST || "")
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//i, "")
      .replace(/\/.*$/, "");
    const onionEnabled = /^[a-z2-7]{56}\.onion$/.test(cleanHost);

    return [
      {
        source: "/embed/:path*",
        headers: [
          ...baseSecurityHeaders,
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *; object-src 'none'; base-uri 'self'; form-action 'none';",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
      {
        source: "/:path((?!embed(?:/|$)).*)",
        headers: [
          ...baseSecurityHeaders,
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';",
          },
        ],
      },
      ...(onionEnabled
        ? [
            {
              source: "/:path+",
              headers: [
                {
                  key: "Onion-Location",
                  value: `http://${cleanHost}/:path+`,
                },
              ],
            },
            {
              source: "/",
              headers: [{ key: "Onion-Location", value: `http://${cleanHost}/` }],
            },
          ]
        : []),
    ];
  },
  outputFileTracingRoot: path.join(__dirname, "../.."),
  serverExternalPackages: ["cheerio", "undici"],
};

module.exports = nextConfig
