import {
  CAB,
  CRUISE_SPEED,
  HITCH_GAP,
  MAX_HITCH,
  MAX_SPEED,
  MAX_STEERING,
  MIN_SPEED,
  ACCEL,
  BRAKE,
  PICKUP_MARGIN,
  PICKUP_MIN_DIST,
  TRAILER,
  WORLD_H,
  WORLD_W,
} from "./config";
import type { InputKeys, Pickup, SegmentState } from "./types";

export type DriveState = {
  speed: number;
  steering: number;
  segments: SegmentState[];
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function normalizeAngle(a: number): number {
  let x = a;
  while (x > Math.PI) x -= Math.PI * 2;
  while (x < -Math.PI) x += Math.PI * 2;
  return x;
}

export function spawnCab(x: number, y: number, angle: number): SegmentState {
  return {
    x,
    y,
    angle,
    length: CAB.length,
    width: CAB.width,
    role: "cab",
    attachT: 1,
  };
}

export function rearHitch(seg: SegmentState): { x: number; y: number } {
  return {
    x: seg.x - Math.cos(seg.angle) * (seg.length / 2),
    y: seg.y - Math.sin(seg.angle) * (seg.length / 2),
  };
}

export function hitchTarget(
  prev: SegmentState,
  length: number
): { x: number; y: number; angle: number } {
  const hitch = rearHitch(prev);
  const dist = length / 2 + HITCH_GAP;
  return {
    x: hitch.x - Math.cos(prev.angle) * dist,
    y: hitch.y - Math.sin(prev.angle) * dist,
    angle: prev.angle,
  };
}

export function followTrailers(segments: SegmentState[]): void {
  for (let i = 1; i < segments.length; i++) {
    const prev = segments[i - 1];
    const seg = segments[i];
    if (seg.attachT < 1) continue;
    const hitch = rearHitch(prev);
    const dist = seg.length / 2 + HITCH_GAP;
    // Rear axle cannot slide sideways: yaw from old rear toward the pulled hitch.
    const rearX = seg.x - Math.cos(seg.angle) * (seg.length / 2);
    const rearY = seg.y - Math.sin(seg.angle) * (seg.length / 2);
    let newAngle = Math.atan2(hitch.y - rearY, hitch.x - rearX);
    const bend = clamp(
      normalizeAngle(newAngle - prev.angle),
      -MAX_HITCH,
      MAX_HITCH
    );
    newAngle = normalizeAngle(prev.angle + bend);
    seg.angle = newAngle;
    seg.x = hitch.x - Math.cos(newAngle) * dist;
    seg.y = hitch.y - Math.sin(newAngle) * dist;
  }
}

export function stepDrive(
  state: DriveState,
  keys: InputKeys,
  dtMs: number
): DriveState {
  const k = Math.min(2.2, dtMs / 16.67);
  let { speed, steering } = state;
  const segments = state.segments.map((s) => ({ ...s }));
  const cab = segments[0];
  if (!cab) return state;

  if (keys.up) speed += ACCEL * k;
  else if (keys.brake || keys.down) speed -= BRAKE * k;
  else if (speed > CRUISE_SPEED) speed -= ACCEL * 0.55 * k;
  else if (speed < CRUISE_SPEED) speed += ACCEL * 0.4 * k;

  speed = clamp(speed, MIN_SPEED, MAX_SPEED);

  let target = 0;
  if (keys.left) target = -MAX_STEERING;
  if (keys.right) target = MAX_STEERING;
  steering += (target - steering) * (0.18 * k);

  const v = speed * k;
  const wheelbase = Math.max(36, cab.length * 0.55);
  cab.angle += (v * Math.tan(steering)) / wheelbase;
  cab.x += Math.cos(cab.angle) * v;
  cab.y += Math.sin(cab.angle) * v;

  followTrailers(segments);
  return { speed, steering, segments };
}

export function easeOutCubic(t: number) {
  const x = clamp(t, 0, 1);
  return 1 - (1 - x) ** 3;
}

export function stepAttach(
  segments: SegmentState[],
  dtMs: number,
  attachMs: number
): SegmentState[] {
  return segments.map((seg, i) => {
    if (i === 0 || seg.attachT >= 1) return seg;
    const nextT = clamp(seg.attachT + dtMs / attachMs, 0, 1);
    const prev = segments[i - 1];
    const target = hitchTarget(prev, seg.length);
    const e = easeOutCubic(nextT);
    const ox = seg.originX ?? seg.x;
    const oy = seg.originY ?? seg.y;
    const oa = seg.originAngle ?? seg.angle;
    return {
      ...seg,
      attachT: nextT,
      x: ox + (target.x - ox) * e,
      y: oy + (target.y - oy) * e,
      angle: oa + normalizeAngle(target.angle - oa) * e,
    };
  });
}

type Circle = { x: number; y: number; r: number };

function segmentCircles(seg: SegmentState, shrink = 0): Circle[] {
  const r = Math.max(4, seg.width / 2 - shrink);
  const offset = seg.length / 2 - r;
  return [0, offset, -offset].map((dist) => ({
    x: seg.x + Math.cos(seg.angle) * dist,
    y: seg.y + Math.sin(seg.angle) * dist,
    r,
  }));
}

export function hitsWorldEdge(segments: SegmentState[]): boolean {
  const pad = 18;
  for (const seg of segments) {
    if (seg.role !== "cab" && seg.attachT < 1) continue;
    for (const c of segmentCircles(seg)) {
      if (c.x - c.r < pad || c.x + c.r > WORLD_W - pad) return true;
      if (c.y - c.r < pad || c.y + c.r > WORLD_H - pad) return true;
    }
  }
  return false;
}

function circlesOverlap(a: Circle, b: Circle): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const rr = a.r + b.r;
  return dx * dx + dy * dy < rr * rr * 0.72;
}

/** Cab vs locked trailers (skip the first trailer — too close to hitch). */
export function hitsOwnConvoy(segments: SegmentState[]): boolean {
  const cab = segments[0];
  if (!cab) return false;
  const cabCircles = segmentCircles(cab, 2);
  for (let i = 2; i < segments.length; i++) {
    const seg = segments[i];
    if (seg.attachT < 1) continue;
    for (const a of cabCircles) {
      for (const b of segmentCircles(seg, 4)) {
        if (circlesOverlap(a, b)) return true;
      }
    }
  }
  return false;
}

export function hitsPickup(cab: SegmentState, pickup: Pickup): boolean {
  const hitR = TRAILER.width * 0.5 + 10;
  for (const c of segmentCircles(cab, 0)) {
    const dx = c.x - pickup.x;
    const dy = c.y - pickup.y;
    const rr = c.r + hitR;
    if (dx * dx + dy * dy < rr * rr) return true;
  }
  return false;
}

export function randomPickup(
  segments: SegmentState[],
  avoid: Pickup | null
): Pickup {
  for (let i = 0; i < 40; i++) {
    const x =
      PICKUP_MARGIN +
      Math.random() * (WORLD_W - PICKUP_MARGIN * 2);
    const y =
      PICKUP_MARGIN +
      Math.random() * (WORLD_H - PICKUP_MARGIN * 2);
    const cab = segments[0];
    const distCab = cab ? Math.hypot(x - cab.x, y - cab.y) : 9999;
    if (distCab < PICKUP_MIN_DIST) continue;
    const tooClose = segments.some(
      (s) => Math.hypot(x - s.x, y - s.y) < 90
    );
    if (tooClose) continue;
    if (avoid && Math.hypot(x - avoid.x, y - avoid.y) < 180) continue;
    return { x, y, angle: Math.random() * Math.PI * 2, spawnT: 0 };
  }
  return {
    x: WORLD_W * 0.7,
    y: WORLD_H * 0.35,
    angle: 0,
    spawnT: 0,
  };
}

export function cameraOrigin(
  leadX: number,
  leadY: number,
  viewW: number,
  viewH: number
) {
  return {
    x: Math.max(0, Math.min(WORLD_W - viewW, leadX - viewW / 2)),
    y: Math.max(0, Math.min(WORLD_H - viewH, leadY - viewH / 2)),
  };
}
