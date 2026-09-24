/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const onionHost = process.env.NEXT_PUBLIC_TOR_ONION_HOST || "jcqyihxqjobepnfit2u7qwmo6e4hvhxphujkw7qwx7abugvfjqm3jnqd.onion";
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
