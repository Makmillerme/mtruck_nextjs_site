import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import os from "node:os";
import { generateUniqueUserCode } from "@/lib/codes";
import db from "@/utils/db";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const authBaseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
const isDev = process.env.NODE_ENV === "development";

/** Current PC LAN IPv4s — exact origins for phone-dev Wi-Fi (ADB uses localhost). */
function lanExactOrigins() {
  const origins: string[] = [];
  for (const list of Object.values(os.networkInterfaces())) {
    if (!list) continue;
    for (const net of list) {
      if (net.family !== "IPv4") continue;
      if (net.internal) continue;
      origins.push(`http://${net.address}:3000`, `http://${net.address}:3001`);
    }
  }
  return origins;
}

/**
 * Dev phone-preview: resolve baseURL from the request Host (LAN IP),
 * not only BETTER_AUTH_URL=localhost — otherwise cookies/CSRF break on Wi-Fi.
 * Production stays on the fixed env URL.
 */
const baseURL = isDev
  ? {
      allowedHosts: [
        "localhost",
        "localhost:*",
        "127.0.0.1",
        "127.0.0.1:*",
        "192.168.*.*",
        "192.168.*.*:*",
        "10.*.*.*",
        "10.*.*.*:*",
        "172.*.*.*",
        "172.*.*.*:*",
      ],
      protocol: "http" as const,
      fallback: authBaseUrl,
    }
  : authBaseUrl;

const lanTrustedOrigins = isDev
  ? [
      ...lanExactOrigins(),
      "http://192.168.*.*:3000",
      "http://192.168.*.*:3001",
      "http://10.*.*.*:3000",
      "http://10.*.*.*:3001",
      "http://172.*.*.*:3000",
      "http://172.*.*.*:3001",
    ]
  : [];

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [authBaseUrl, ...lanTrustedOrigins],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
        input: false,
      },
      userCode: {
        type: "string",
        required: false,
        input: false,
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const userCode = await generateUniqueUserCode();
          return {
            data: {
              ...user,
              userCode,
            },
          };
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          const row = await db.user.findUnique({
            where: { id: session.userId },
            select: { archivedAt: true },
          });
          if (row?.archivedAt) {
            throw new Error("Account archived");
          }
          return { data: session };
        },
      },
    },
  },
  socialProviders: {
    ...(googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        }
      : {}),
  },
  plugins: [nextCookies()],
});
