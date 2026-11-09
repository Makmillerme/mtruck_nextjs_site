/** @type {import('next').NextConfig} */
import createNextIntlPlugin from "next-intl/plugin";
import os from "node:os";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** LAN / Tailscale hosts for phone-dev Wi-Fi (next dev only; ignored in production). */
function lanDevOrigins() {
  const hosts = new Set();
  for (const list of Object.values(os.networkInterfaces())) {
    if (!list) continue;
    for (const net of list) {
      if (net.family !== "IPv4" && net.family !== 4) continue;
      if (net.internal) continue;
      hosts.add(net.address);
    }
  }
  return [...hosts];
}

const nextConfig = {
  // Phone preview over Wi-Fi: allow /_next/* from PC LAN IP (Next 16 blocks cross-origin by default).
  allowedDevOrigins: lanDevOrigins(),
  // Gallery: up to 15 images; each raw upload ≤10MB before server WebP compress.
  experimental: {
    // Dev MCP get_request_insights + DevTools request timeline (restart next dev).
    requestInsights: true,
    serverActions: {
      bodySizeLimit: "32mb",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "robohash.org",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
