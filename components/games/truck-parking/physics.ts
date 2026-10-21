import type {
  Aabb,
  InputKeys,
  ParkingSpot,
  SegmentState,
  VehicleDef,
} from "./types";

export type DriveState = {
  speed: number;
  steeringAngle: number;
  segments: SegmentState[];
};

function normalizeAngle(a: number): number {
  let x = a;
  while (x > Math.PI) x -= Math.PI * 2;
  while (x < -Math.PI) x += Math.PI * 2;
  return x;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/** Place articulated convoy so cab center is at (x,y) facing angle. */
export function spawnSegments(
  def: VehicleDef,
  x: number,
  y: number,
  angle: number
): SegmentState[] {
  const segs: SegmentState[] = [];
  let hitchX = x;
  let hitchY = y;
  let hitchAngle = angle;

  def.segments.forEach((seg, index) => {
    if (index === 0) {
      segs.push({
        x,
        y,
        angle,
        length: seg.length,
        width: seg.width,
        role: seg.role,
      });
      // Rear hitch of drive segment
      hitchX = x - Math.cos(angle) * (seg.length / 2);
      hitchY = y - Math.sin(angle) * (seg.length / 2);
      hitchAngle = angle;
      return;
    }
    const cx = hitchX - Math.cos(hitchAngle) * (seg.length / 2);
    const cy = hitchY - Math.sin(hitchAngle) * (seg.length / 2);
    segs.push({
      x: cx,
      y: cy,
      angle: hitchAngle,
      length: seg.length,
      width: seg.width,
      role: seg.role,
    });
    hitchX = cx - Math.cos(hitchAngle) * (seg.length / 2);
    hitchY = cy - Math.sin(hitchAngle) * (seg.length / 2);
  });

  return segs;
}

export function stepDrive(
  def: VehicleDef,
  state: DriveState,
  keys: InputKeys
): DriveState {
  let { speed, steeringAngle } = state;
  const segments = state.segments.map((s) => ({ ...s }));
  const drive = segments[0];
  if (!drive) return state;

  if (keys.up) speed += def.acceleration;
  else if (keys.down) speed -= def.acceleration;

  if (keys.brake) {
    if (speed > 0) speed -= def.brakeForce;
    if (speed < 0) speed += def.brakeForce;
    if (Math.abs(speed) < def.brakeForce) speed = 0;
  }

  speed *= def.friction;
  speed = clamp(speed, def.minSpeed, def.maxSpeed);

  let targetSteering = 0;
  if (keys.left) targetSteering = -def.maxSteering;
  if (keys.right) targetSteering = def.maxSteering;
  steeringAngle += (targetSteering - steeringAngle) * 0.12;

  if (Math.abs(speed) > 0.08) {
    const dir = speed > 0 ? 1 : -1;
    drive.angle +=
      steeringAngle * dir * (Math.abs(speed) / def.maxSpeed);
  }

  drive.x += Math.cos(drive.angle) * speed;
  drive.y += Math.sin(drive.angle) * speed;

  // Follow-the-leader: each trailer front hitch follows previous rear hitch
  for (let i = 1; i < segments.length; i++) {
    const prev = segments[i - 1];
    const seg = segments[i];
    const hitchX = prev.x - Math.cos(prev.angle) * (prev.length / 2);
    const hitchY = prev.y - Math.sin(prev.angle) * (prev.length / 2);

    const desired = Math.atan2(hitchY - seg.y, hitchX - seg.x);
    let bend = normalizeAngle(desired - prev.angle);
    bend = clamp(bend, -def.maxHitchAngle, def.maxHitchAngle);
    seg.angle = normalizeAngle(prev.angle + bend);

    seg.x = hitchX - Math.cos(seg.angle) * (seg.length / 2);
    seg.y = hitchY - Math.sin(seg.angle) * (seg.length / 2);
  }

  return { speed, steeringAngle, segments };
}

type Circle = { x: number; y: number; r: number };

function segmentCircles(seg: SegmentState): Circle[] {
  const r = seg.width / 2;
  const offset = seg.length / 2 - r;
  return [0, offset, -offset].map((dist) => ({
    x: seg.x + Math.cos(seg.angle) * dist,
    y: seg.y + Math.sin(seg.angle) * dist,
    r,
  }));
}

function circleHitsAabb(c: Circle, obs: Aabb): boolean {
  let testX = c.x;
  let testY = c.y;
  if (c.x < obs.x) testX = obs.x;
  else if (c.x > obs.x + obs.width) testX = obs.x + obs.width;
  if (c.y < obs.y) testY = obs.y;
  else if (c.y > obs.y + obs.height) testY = obs.y + obs.height;
  const dx = c.x - testX;
  const dy = c.y - testY;
  return Math.sqrt(dx * dx + dy * dy) <= c.r;
}

export function checkCollision(
  segments: SegmentState[],
  obstacles: Aabb[]
): boolean {
  for (const seg of segments) {
    for (const c of segmentCircles(seg)) {
      for (const obs of obstacles) {
        if (circleHitsAabb(c, obs)) return true;
      }
    }
  }
  return false;
}

/** Push whole convoy back along drive heading after crash. */
export function reboundAfterCrash(
  state: DriveState
): DriveState {
  const drive = state.segments[0];
  if (!drive || Math.abs(state.speed) < 0.01) {
    return { ...state, speed: 0 };
  }
  const push = state.speed * 3;
  const next = state.segments.map((s, i) =>
    i === 0
      ? {
          ...s,
          x: s.x - Math.cos(s.angle) * push,
          y: s.y - Math.sin(s.angle) * push,
        }
      : { ...s }
  );
  // Re-link trailers from rebounded cab
  for (let i = 1; i < next.length; i++) {
    const prev = next[i - 1];
    const seg = next[i];
    const hitchX = prev.x - Math.cos(prev.angle) * (prev.length / 2);
    const hitchY = prev.y - Math.sin(prev.angle) * (prev.length / 2);
    seg.x = hitchX - Math.cos(seg.angle) * (seg.length / 2);
    seg.y = hitchY - Math.sin(seg.angle) * (seg.length / 2);
  }
  return { speed: 0, steeringAngle: state.steeringAngle, segments: next };
}

export function pointInSpot(
  x: number,
  y: number,
  spot: ParkingSpot,
  margin = 10
): boolean {
  const cx = spot.x + spot.width / 2;
  const cy = spot.y + spot.height / 2;
  const dx = x - cx;
  const dy = y - cy;
  const localX = dx * Math.cos(-spot.angle) - dy * Math.sin(-spot.angle);
  const localY = dx * Math.sin(-spot.angle) + dy * Math.cos(-spot.angle);
  return (
    Math.abs(localX) < spot.width / 2 - margin &&
    Math.abs(localY) < spot.height / 2 - margin
  );
}

export function parkingAlignment(
  driveAngle: number,
  spot: ParkingSpot
): { aligned: boolean; angleDiff: number } {
  let angleDiff = Math.abs(
    normalizeAngle(driveAngle) - normalizeAngle(spot.angle)
  );
  // Allow 180° flip (reverse park)
  angleDiff = Math.min(angleDiff, Math.PI - angleDiff);
  // Also compare to perpendicular storage when spot.angle is PI/2
  const alt = Math.abs(
    normalizeAngle(driveAngle) - normalizeAngle(spot.angle + Math.PI)
  );
  const altMin = Math.min(alt, Math.PI - alt);
  const best = Math.min(angleDiff, altMin);
  return { aligned: best < 0.35, angleDiff: best };
}

export function allSegmentsInSpot(
  segments: SegmentState[],
  spot: ParkingSpot
): boolean {
  return segments.every((s) => {
    // Check center + nose + tail
    const pts = [
      { x: s.x, y: s.y },
      {
        x: s.x + Math.cos(s.angle) * (s.length / 2 - 4),
        y: s.y + Math.sin(s.angle) * (s.length / 2 - 4),
      },
      {
        x: s.x - Math.cos(s.angle) * (s.length / 2 - 4),
        y: s.y - Math.sin(s.angle) * (s.length / 2 - 4),
      },
    ];
    return pts.every((p) => pointInSpot(p.x, p.y, spot, 6));
  });
}

export function scoreParking(
  segments: SegmentState[],
  spot: ParkingSpot,
  angleDiff: number
): number {
  const cx = spot.x + spot.width / 2;
  const cy = spot.y + spot.height / 2;
  const drive = segments[0];
  if (!drive) return 0;
  const dx = drive.x - cx;
  const dy = drive.y - cy;
  const localX = dx * Math.cos(-spot.angle) - dy * Math.sin(-spot.angle);
  const localY = dx * Math.sin(-spot.angle) + dy * Math.cos(-spot.angle);
  const maxDistX = Math.max(1, spot.width / 2 - 10);
  const maxDistY = Math.max(1, spot.height / 2 - 10);
  const posAccuracyX = 100 - (Math.abs(localX) / maxDistX) * 100;
  const posAccuracyY = 100 - (Math.abs(localY) / maxDistY) * 100;
  const posAccuracy = (posAccuracyX + posAccuracyY) / 2;
  const angAccuracy = 100 - (angleDiff / 0.35) * 100;
  return Math.round(
    clamp(posAccuracy, 0, 100) * 0.6 + clamp(angAccuracy, 0, 100) * 0.4
  );
}
