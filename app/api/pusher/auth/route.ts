import { getPusherServer } from "@/lib/realtime/pusher-server";
import { STAFF_NOTIFICATIONS_CHANNEL } from "@/lib/realtime/channels";
import { getSession, getUserRole, isStaffRole } from "@/utils/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const pusher = getPusherServer();
  if (!pusher) {
    return Response.json({ error: "Pusher not configured" }, { status: 503 });
  }

  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const role = await getUserRole(userId);
  if (!isStaffRole(role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  let socketId = "";
  let channelName = "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as {
      socket_id?: string;
      channel_name?: string;
    };
    socketId = String(body.socket_id ?? "");
    channelName = String(body.channel_name ?? "");
  } else {
    const form = await request.formData();
    socketId = String(form.get("socket_id") ?? "");
    channelName = String(form.get("channel_name") ?? "");
  }

  if (!socketId || channelName !== STAFF_NOTIFICATIONS_CHANNEL) {
    return Response.json({ error: "Invalid channel" }, { status: 403 });
  }

  const auth = pusher.authorizeChannel(socketId, channelName);
  return Response.json(auth);
}
