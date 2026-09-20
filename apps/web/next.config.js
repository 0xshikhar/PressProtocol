/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const onionHost = process.env.NEXT_PUBLIC_TOR_ONION_HOST || "pressprotocol7sovereign4node6federation3mesh7relay5v3.onion";
    const cleanHost = onionHost.replace(/^https?:\/\//i, "").replace(/\/+$/, "");

    return [
      {
        source: "/embed/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *;",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Onion-Location",
            value: `http://${cleanHost}/:path*`,
          },
        ],
      },
    ];
  },
  experimental: {
    serverComponentsExternalPackages: ["cheerio", "undici"],
  },
};

module.exports = nextConfig
