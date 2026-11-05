import "server-only";

import Pusher from "pusher";
import {
  INQUIRY_CREATED_EVENT,
  STAFF_NOTIFICATIONS_CHANNEL,
  type InquiryCreatedPayload,
} from "@/lib/realtime/channels";

function readServerConfig() {
  const appId = process.env.PUSHER_APP_ID?.trim();
  const key = process.env.PUSHER_KEY?.trim();
  const secret = process.env.PUSHER_SECRET?.trim();
  const cluster = process.env.PUSHER_CLUSTER?.trim();
  if (!appId || !key || !secret || !cluster) return null;
  return { appId, key, secret, cluster };
}

let client: Pusher | null | undefined;

export function getPusherServer(): Pusher | null {
  if (client !== undefined) return client;
  const config = readServerConfig();
  if (!config) {
    client = null;
    return client;
  }
  client = new Pusher({
    appId: config.appId,
    key: config.key,
    secret: config.secret,
    cluster: config.cluster,
    useTLS: true,
  });
  return client;
}

export async function publishInquiryCreated(
  payload: InquiryCreatedPayload
): Promise<void> {
  const pusher = getPusherServer();
  if (!pusher) return;
  try {
    await pusher.trigger(
      STAFF_NOTIFICATIONS_CHANNEL,
      INQUIRY_CREATED_EVENT,
      payload
    );
  } catch (error) {
    console.error("pusher.trigger inquiry.created failed", error);
  }
}
