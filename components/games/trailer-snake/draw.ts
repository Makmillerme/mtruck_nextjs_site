import {
  HITCH_GAP,
  TRAILER,
  VIEW_H,
  VIEW_W,
  WORLD_H,
  WORLD_W,
} from "./config";
import { cameraOrigin } from "./physics";
import type { GameSnapshot, Pickup, SegmentState } from "./types";

const C = {
  navy: "#0f172a",
  navyHi: "#1e293b",
  yard: "#243044",
  chalk: "rgba(248,250,252,0.28)",
  plate: "#ffffff",
  corrugation: "#e2e8f0",
  pad: "#e4e6ea",
  glass: "rgba(248,250,252,0.82)",
  wheel: "#020617",
  hitch: "#6f737b",
  nav: "#ffffff",
  pickupRing: "rgba(248,250,252,0.72)",
  tail: "#7f1d1d",
  stripe: "#0f172a",
};

export function drawTrailerSnake(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  snap: GameSnapshot,
  nowMs: number
) {
  const lead = snap.segments[0];
  const cam = cameraOrigin(
    lead?.x ?? WORLD_W / 2,
    lead?.y ?? WORLD_H / 2,
    VIEW_W,
    VIEW_H
  );

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const sx = canvas.width / VIEW_W;
  const sy = canvas.height / VIEW_H;
  ctx.setTransform(sx, 0, 0, sy, 0, 0);

  ctx.save();
  ctx.translate(-cam.x, -cam.y);
  drawWorld(ctx);
  if (snap.pickup) drawPickup(ctx, snap.pickup, nowMs);
  // Trailers first so cab sits on top
  for (let i = snap.segments.length - 1; i >= 0; i--) {
    drawSegment(ctx, snap.segments[i], i === 0);
  }
  if (lead && snap.pickup && snap.state === "playing") {
    drawNav(ctx, lead, snap.pickup);
  }
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawWorld(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = C.navy;
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);

  ctx.fillStyle = C.yard;
  ctx.fillRect(48, 48, WORLD_W - 96, WORLD_H - 96);

  ctx.strokeStyle = C.navyHi;
  ctx.lineWidth = 8;
  ctx.strokeRect(48, 48, WORLD_W - 96, WORLD_H - 96);

  ctx.strokeStyle = C.chalk;
  ctx.lineWidth = 2;
  ctx.setLineDash([16, 18]);
  ctx.beginPath();
  ctx.moveTo(120, WORLD_H / 2);
  ctx.lineTo(WORLD_W - 120, WORLD_H / 2);
  ctx.moveTo(WORLD_W / 2, 120);
  ctx.lineTo(WORLD_W / 2, WORLD_H - 120);
  ctx.stroke();
  ctx.setLineDash([]);

  const pads = [
    [80, 70, 180, 90],
    [1740, 80, 180, 90],
    [80, 1220, 200, 90],
    [1720, 1220, 200, 90],
    [900, 56, 200, 64],
  ] as const;
  pads.forEach(([x, y, w, h]) => {
    ctx.fillStyle = C.pad;
    ctx.strokeStyle = C.navy;
    ctx.lineWidth = 1.5;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = C.stripe;
    ctx.fillRect(x, y + h * 0.38, w, h * 0.24);
  });
}

function paintContainer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  l: number,
  w: number
) {
  ctx.fillStyle = C.plate;
  ctx.strokeStyle = C.navy;
  ctx.lineWidth = 2;
  ctx.fillRect(x, y, l, w);
  ctx.strokeRect(x, y, l, w);
  // Vertical corrugation — shipping container ribs, not a brand band
  ctx.strokeStyle = C.corrugation;
  ctx.lineWidth = 1;
  for (let i = 5; i < l - 5; i += 5) {
    ctx.beginPath();
    ctx.moveTo(x + i, y + 1);
    ctx.lineTo(x + i, y + w - 1);
    ctx.stroke();
  }
  // Thin end rails (door / front frame)
  ctx.fillStyle = C.navy;
  ctx.fillRect(x, y, 3, w);
  ctx.fillRect(x + l - 3, y, 3, w);
}

function drawContainerBox(
  ctx: CanvasRenderingContext2D,
  l: number,
  w: number,
  opts: { hitch?: boolean; landingGear?: boolean; lights?: boolean }
) {
  const halfL = l / 2;
  const halfW = w / 2;
  const wheelW = 11;
  const wheelH = 5;

  ctx.fillStyle = C.wheel;
  [-halfL * 0.42, halfL * 0.22].forEach((ax) => {
    ctx.fillRect(ax - wheelW / 2, -halfW - 2, wheelW, wheelH);
    ctx.fillRect(ax - wheelW / 2, halfW - wheelH + 2, wheelW, wheelH);
  });

  if (opts.hitch) {
    ctx.fillStyle = C.hitch;
    ctx.fillRect(halfL - 2, -3, HITCH_GAP + 4, 6);
    ctx.fillStyle = C.navy;
    ctx.beginPath();
    ctx.arc(halfL + HITCH_GAP, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  paintContainer(ctx, -halfL, -halfW, l, w);

  if (opts.lights) {
    ctx.fillStyle = C.tail;
    ctx.fillRect(-halfL, -halfW + 2, 3, 6);
    ctx.fillRect(-halfL, halfW - 8, 3, 6);
  }

  if (opts.landingGear) {
    ctx.fillStyle = C.hitch;
    ctx.fillRect(halfL - 16, -halfW - 5, 5, 5);
    ctx.fillRect(halfL - 16, halfW, 5, 5);
  }
}

function drawPickup(
  ctx: CanvasRenderingContext2D,
  pickup: Pickup,
  nowMs: number
) {
  const pop = easeOutBack(pickup.spawnT);
  const pulse = 0.94 + Math.sin(nowMs / 320) * 0.06;

  ctx.save();
  ctx.translate(pickup.x, pickup.y);
  ctx.rotate(pickup.angle);
  ctx.scale(pop * pulse, pop * pulse);

  const ring = TRAILER.length * 0.72 + Math.sin(nowMs / 280) * 4;
  ctx.strokeStyle = C.pickupRing;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([8, 7]);
  ctx.beginPath();
  ctx.ellipse(0, 0, ring, TRAILER.width * 0.85, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  drawContainerBox(ctx, TRAILER.length, TRAILER.width, {
    hitch: true,
    landingGear: true,
    lights: true,
  });
  ctx.restore();
}

function easeOutBack(t: number) {
  const x = Math.max(0, Math.min(1, t));
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2;
}

function drawNav(ctx: CanvasRenderingContext2D, cab: SegmentState, pickup: Pickup) {
  const dist = Math.hypot(pickup.x - cab.x, pickup.y - cab.y);
  if (dist < 90) return;
  const ang = Math.atan2(pickup.y - cab.y, pickup.x - cab.x);
  const d = Math.min(70, dist * 0.22);
  const x = cab.x + Math.cos(ang) * (cab.length / 2 + d);
  const y = cab.y + Math.sin(ang) * (cab.length / 2 + d);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.globalAlpha = 1;
  ctx.fillStyle = C.nav;
  ctx.strokeStyle = C.navy;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(14, 0);
  ctx.lineTo(-8, -9);
  ctx.lineTo(-4, 0);
  ctx.lineTo(-8, 9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawSegment(
  ctx: CanvasRenderingContext2D,
  seg: SegmentState,
  isCab: boolean
) {
  ctx.save();
  ctx.translate(seg.x, seg.y);
  ctx.rotate(seg.angle);
  const appear = 0.72 + 0.28 * seg.attachT;
  ctx.globalAlpha = appear;
  const s = 0.96 + 0.04 * seg.attachT;
  ctx.scale(s, s);

  const l = seg.length;
  const w = seg.width;
  const halfL = l / 2;
  const halfW = w / 2;

  // Ground disc so the convoy reads on dark asphalt
  ctx.fillStyle = "rgba(248,250,252,0.08)";
  ctx.beginPath();
  ctx.ellipse(0, 0, halfL + 6, halfW + 8, 0, 0, Math.PI * 2);
  ctx.fill();

  if (isCab) {
  ctx.fillStyle = C.wheel;
  const wheelW = 11;
  const wheelH = 5;
  [-halfL * 0.38, halfL * 0.32].forEach((ax) => {
    ctx.fillRect(ax - wheelW / 2, -halfW - 2, wheelW, wheelH);
    ctx.fillRect(ax - wheelW / 2, halfW - wheelH + 2, wheelW, wheelH);
  });
    // Rigid container truck — navy cab, white plate, brand stripe
    const trL = l * 0.7;
    const cabL = l * 0.25;
    const cabX = halfL - cabL;

    ctx.fillStyle = C.wheel;
    const extraAxle = -halfL * 0.12;
    ctx.fillRect(extraAxle - wheelW / 2, -halfW - 2, wheelW, wheelH);
    ctx.fillRect(extraAxle - wheelW / 2, halfW - wheelH + 2, wheelW, wheelH);

    paintContainer(ctx, -halfL, -halfW, trL, w);

    ctx.fillStyle = C.navy;
    roundRect(ctx, cabX, -halfW + 1, cabL, w - 2, 3);
    ctx.fill();
    ctx.strokeStyle = C.plate;
    ctx.lineWidth = 1.5;
    roundRect(ctx, cabX, -halfW + 1, cabL, w - 2, 3);
    ctx.stroke();

    ctx.fillStyle = C.glass;
    ctx.beginPath();
    ctx.moveTo(halfL - 5, -halfW + 3);
    ctx.quadraticCurveTo(halfL, 0, halfL - 5, halfW - 3);
    ctx.lineTo(halfL - 2, halfW - 5);
    ctx.quadraticCurveTo(halfL + 1, 0, halfL - 2, -halfW + 5);
    ctx.fill();

    ctx.fillStyle = C.plate;
    ctx.fillRect(halfL - 2, -halfW + 3, 3, 5);
    ctx.fillRect(halfL - 2, halfW - 8, 3, 5);

    ctx.fillStyle = C.tail;
    ctx.fillRect(-halfL, -halfW + 2, 3, 6);
    ctx.fillRect(-halfL, halfW - 8, 3, 6);

    ctx.fillStyle = C.hitch;
    ctx.beginPath();
    ctx.arc(-halfL - 1, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();


  } else {
    drawContainerBox(ctx, l, w, {
      hitch: true,
      landingGear: false,
      lights: true,
    });
  }

  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
