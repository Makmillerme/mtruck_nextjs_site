"use client";

import Pusher from "pusher-js";

let client: Pusher | null = null;

export function getPusherClient(): Pusher | null {
  if (typeof window === "undefined") return null;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY?.trim();
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER?.trim();
  if (!key || !cluster) return null;
  if (client) return client;
  client = new Pusher(key, {
    cluster,
    authEndpoint: "/api/pusher/auth",
  });
  return client;
}
