import type {
  Aabb,
  BiomeRect,
  Decoration,
  GamePhase,
  MapDef,
  MapProp,
  ParkingSpot,
  PathPoint,
  RoadSegment,
  SegmentState,
} from "./types";
import { cameraOrigin } from "./map-hub";

const PALETTE = {
  village: "#c5e1a5",
  city: "#94a3b8",
  park: "#4ade80",
  terminal: "#fbbf24",
  yard: "#64748b",
  asphalt: "#1e293b",
  asphaltEdge: "#0f172a",
  chalk: "#f8fafc",
  yellow: "#eab308",
  building: "#e2e8f0",
  buildingStroke: "#334155",
  warehouse: "#f1f5f9",
  grassDark: "#22c55e",
  path: "#38bdf8",
};

export function drawScene(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  map: MapDef,
  spot: ParkingSpot,
  segments: SegmentState[],
  phase: GamePhase,
  speed: number,
  braking: boolean,
  nowMs = performance.now()
) {
  const lead = segments[0];
  const focusX = lead?.x ?? map.start.x;
  const focusY = lead?.y ?? map.start.y;
  const cam = cameraOrigin(focusX, focusY, map);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Letterbox if canvas buffer != view size
  const scaleX = canvas.width / map.viewWidth;
  const scaleY = canvas.height / map.viewHeight;
  ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);

  ctx.save();
  ctx.translate(-cam.x, -cam.y);

  drawBiomes(ctx, map.biomes, map.width, map.height);
  drawRoads(ctx, map.roads);
  drawDecorations(ctx, map.decorations);
  drawPathChevrons(ctx, map.path, nowMs);
  drawSpot(ctx, spot, phase === "parking");
  drawObstacles(ctx, map.obstacles);
  drawObstacles(ctx, map.parkedTrucks);
  drawProps(ctx, map.props, lead ?? null, map.barrier);
  segments.forEach((seg, i) =>
    drawSegment(ctx, seg, i === 0, speed, braking)
  );

  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawBiomes(
  ctx: CanvasRenderingContext2D,
  biomes: BiomeRect[],
  worldW: number,
  worldH: number
) {
  ctx.fillStyle = PALETTE.village;
  ctx.fillRect(0, 0, worldW, worldH);

  biomes.forEach((b) => {
    ctx.fillStyle = PALETTE[b.kind] ?? PALETTE.yard;
    ctx.fillRect(b.x, b.y, b.w, b.h);
  });

  // Soft biome dividers
  ctx.strokeStyle = "rgba(15,23,42,0.25)";
  ctx.lineWidth = 3;
  biomes.forEach((b) => {
    ctx.beginPath();
    ctx.moveTo(b.x, 0);
    ctx.lineTo(b.x, worldH);
    ctx.stroke();
  });

  // City sidewalk hatch
  const city = biomes.find((b) => b.kind === "city");
  if (city) {
    ctx.strokeStyle = "rgba(15,23,42,0.12)";
    ctx.lineWidth = 1;
    for (let y = city.y; y < city.y + city.h; y += 28) {
      ctx.beginPath();
      ctx.moveTo(city.x, y);
      ctx.lineTo(city.x + city.w, y);
      ctx.stroke();
    }
  }

  // Park darker patches
  const park = biomes.find((b) => b.kind === "park");
  if (park) {
    ctx.fillStyle = "rgba(21,128,61,0.25)";
    ctx.fillRect(park.x + 40, park.y + 200, 160, 120);
    ctx.fillRect(park.x + 260, park.y + 1000, 140, 100);
  }
}

function drawRoads(ctx: CanvasRenderingContext2D, roads: RoadSegment[]) {
  roads.forEach((r) => {
    const dx = r.x2 - r.x1;
    const dy = r.y2 - r.y1;
    const len = Math.hypot(dx, dy) || 1;
    const angle = Math.atan2(dy, dx);
    const cx = (r.x1 + r.x2) / 2;
    const cy = (r.y1 + r.y2) / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Edge / curb
    ctx.fillStyle = PALETTE.asphaltEdge;
    ctx.fillRect(-len / 2 - 2, -r.width / 2 - 4, len + 4, r.width + 8);

    // Asphalt
    ctx.fillStyle = PALETTE.asphalt;
    ctx.fillRect(-len / 2, -r.width / 2, len, r.width);

    // Center dashed chalk
    ctx.strokeStyle = PALETTE.chalk;
    ctx.lineWidth = 3;
    ctx.setLineDash([22, 18]);
    ctx.beginPath();
    ctx.moveTo(-len / 2 + 8, 0);
    ctx.lineTo(len / 2 - 8, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    // Edge lines
    ctx.strokeStyle = "rgba(248,250,252,0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-len / 2, -r.width / 2 + 6);
    ctx.lineTo(len / 2, -r.width / 2 + 6);
    ctx.moveTo(-len / 2, r.width / 2 - 6);
    ctx.lineTo(len / 2, r.width / 2 - 6);
    ctx.stroke();

    if (r.arrows !== false) {
      drawDirectionArrows(ctx, len, r.width);
    }

    ctx.restore();
  });
}

function drawDirectionArrows(
  ctx: CanvasRenderingContext2D,
  len: number,
  width: number
) {
  const spacing = 140;
  const size = Math.min(16, width * 0.22);
  ctx.fillStyle = "rgba(248,250,252,0.7)";
  for (let d = -len / 2 + 60; d < len / 2 - 40; d += spacing) {
    ctx.beginPath();
    ctx.moveTo(d + size, 0);
    ctx.lineTo(d - size * 0.6, -size * 0.7);
    ctx.lineTo(d - size * 0.6, size * 0.7);
    ctx.closePath();
    ctx.fill();
  }
}

function drawPathChevrons(
  ctx: CanvasRenderingContext2D,
  path: PathPoint[],
  nowMs: number
) {
  if (path.length < 2) return;
  const pts = samplePath(path, 28);
  const phase = (nowMs / 380) % pts.length;

  pts.forEach((p, i) => {
    const next = pts[(i + 1) % pts.length];
    const ang = Math.atan2(next.y - p.y, next.x - p.x);
    const pulse = ((i - phase + pts.length) % pts.length) / pts.length;
    const alpha = 0.25 + 0.65 * (1 - Math.min(1, pulse * 1.4));

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(ang);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = PALETTE.path;
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(-6, -8);
    ctx.lineTo(-6, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
  ctx.globalAlpha = 1;
}

function samplePath(path: PathPoint[], step: number): PathPoint[] {
  const out: PathPoint[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    const n = Math.max(1, Math.floor(dist / step));
    for (let k = 0; k < n; k++) {
      const t = k / n;
      out.push({
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
      });
    }
  }
  out.push(path[path.length - 1]);
  return out;
}

function drawDecorations(
  ctx: CanvasRenderingContext2D,
  decorations: Decoration[]
) {
  decorations.forEach((d) => {
    if (d.type === "yellow_line") {
      ctx.fillStyle = PALETTE.yellow;
      ctx.fillRect(d.x, d.y, d.w, d.h);
    } else if (d.type === "zone") {
      ctx.strokeStyle = PALETTE.chalk;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(d.x, d.y, d.w, d.h);
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(248,250,252,0.08)";
      ctx.fillRect(d.x, d.y, d.w, d.h);
    }
  });
}

function drawSpot(
  ctx: CanvasRenderingContext2D,
  spot: ParkingSpot,
  active: boolean
) {
  ctx.save();
  ctx.translate(spot.x + spot.width / 2, spot.y + spot.height / 2);
  ctx.rotate(spot.angle);
  if (active) {
    ctx.fillStyle = "rgba(16, 185, 129, 0.28)";
    ctx.fillRect(-spot.width / 2, -spot.height / 2, spot.width, spot.height);
    ctx.strokeStyle = "#10b981";
  } else {
    ctx.fillStyle = "rgba(56, 189, 248, 0.12)";
    ctx.fillRect(-spot.width / 2, -spot.height / 2, spot.width, spot.height);
    ctx.strokeStyle = PALETTE.chalk;
  }
  ctx.lineWidth = 4;
  ctx.setLineDash([14, 8]);
  ctx.strokeRect(-spot.width / 2, -spot.height / 2, spot.width, spot.height);
  ctx.setLineDash([]);
  ctx.fillStyle = active ? "#10b981" : "#38bdf8";
  ctx.font = "bold 26px Manrope, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("P", 0, 0);
  ctx.restore();
}

function drawObstacles(ctx: CanvasRenderingContext2D, list: Aabb[]) {
  list.forEach((obs) => {
    ctx.shadowColor = "rgba(0,0,0,0.28)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 5;

    if (obs.type === "warehouse" || obs.type === "warehouse_back") {
      ctx.fillStyle = PALETTE.warehouse;
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = PALETTE.buildingStroke;
      ctx.lineWidth = 2;
      ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
      if (obs.type === "warehouse") {
        ctx.fillStyle = "#cbd5e1";
        for (let i = obs.x + 28; i < obs.x + obs.width - 28; i += 56) {
          ctx.fillRect(i, obs.y + 28, 24, 24);
          ctx.strokeRect(i, obs.y + 28, 24, 24);
        }
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(
          obs.x + obs.width / 2 - 20,
          obs.y + obs.height - 16,
          40,
          16
        );
      }
    } else if (obs.type === "building") {
      ctx.fillStyle = PALETTE.building;
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = PALETTE.buildingStroke;
      ctx.lineWidth = 2;
      ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
      ctx.fillStyle = "#64748b";
      const cols = Math.max(2, Math.floor(obs.width / 36));
      const rows = Math.max(2, Math.floor(obs.height / 32));
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          ctx.fillRect(
            obs.x + 12 + col * 32,
            obs.y + 12 + row * 28,
            16,
            14
          );
        }
      }
    } else if (obs.type.includes("parked_truck")) {
      const horiz = obs.type === "parked_truck_horiz";
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 2;
      ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
      ctx.fillStyle = "#0f172a";
      if (horiz) {
        ctx.fillRect(obs.x + obs.width - 26, obs.y + 3, 24, obs.height - 6);
      } else {
        ctx.fillRect(obs.x + 3, obs.y + obs.height - 26, obs.width - 6, 24);
      }
    } else if (obs.type === "wall") {
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    } else {
      ctx.fillStyle = "#64748b";
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      ctx.shadowBlur = 0;
    }
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  });
}

function drawProps(
  ctx: CanvasRenderingContext2D,
  props: MapProp[],
  lead: SegmentState | null,
  barrier: MapDef["barrier"]
) {
  const nearBarrier =
    lead != null &&
    Math.hypot(lead.x - (barrier.x + barrier.w / 2), lead.y - barrier.y) < 140;
  const armAngle = nearBarrier ? -Math.PI / 2.2 : 0;

  props.forEach((p) => {
    if (p.kind === "house") {
      ctx.fillStyle = "#fef3c7";
      ctx.strokeStyle = "#92400e";
      ctx.lineWidth = 2;
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = "#b91c1c";
      ctx.beginPath();
      ctx.moveTo(p.x - 4, p.y);
      ctx.lineTo(p.x + p.w / 2, p.y - p.h * 0.45);
      ctx.lineTo(p.x + p.w + 4, p.y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#1e3a8a";
      ctx.fillRect(p.x + p.w * 0.35, p.y + p.h * 0.45, p.w * 0.22, p.h * 0.45);
    } else if (p.kind === "tree") {
      ctx.fillStyle = "#78350f";
      ctx.fillRect(p.x + p.w * 0.4, p.y + p.h * 0.55, p.w * 0.2, p.h * 0.45);
      ctx.fillStyle = PALETTE.grassDark;
      ctx.beginPath();
      ctx.arc(p.x + p.w / 2, p.y + p.h * 0.4, p.w * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#86efac";
      ctx.beginPath();
      ctx.arc(p.x + p.w * 0.35, p.y + p.h * 0.35, p.w * 0.28, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === "bench") {
      ctx.fillStyle = "#a16207";
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = "#713f12";
      ctx.fillRect(p.x + 2, p.y + p.h, 4, 8);
      ctx.fillRect(p.x + p.w - 6, p.y + p.h, 4, 8);
    } else if (p.kind === "fence") {
      ctx.strokeStyle = "#78350f";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.w, p.y);
      ctx.stroke();
      for (let x = p.x; x <= p.x + p.w; x += 18) {
        ctx.beginPath();
        ctx.moveTo(x, p.y - 10);
        ctx.lineTo(x, p.y + 10);
        ctx.stroke();
      }
    } else if (p.kind === "booth") {
      ctx.fillStyle = "#fef08a";
      ctx.strokeStyle = "#854d0e";
      ctx.lineWidth = 2;
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = "#0ea5e9";
      ctx.fillRect(p.x + 8, p.y + 10, p.w - 16, p.h * 0.35);
      ctx.fillStyle = "#111827";
      ctx.font = "bold 10px Manrope, system-ui, sans-serif";
      ctx.fillText("PASS", p.x + 8, p.y + p.h - 6);
    } else if (p.kind === "sign") {
      ctx.fillStyle = "#64748b";
      ctx.fillRect(p.x + p.w / 2 - 2, p.y, 4, p.h);
      ctx.fillStyle = "#2563eb";
      ctx.fillRect(p.x, p.y, p.w, p.h * 0.45);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;
      ctx.strokeRect(p.x, p.y, p.w, p.h * 0.45);
    } else if (p.kind === "barrier") {
      // Post
      ctx.fillStyle = "#111827";
      ctx.fillRect(p.x - 6, p.y - 6, 12, 22);
      // Arm (lifts when truck near)
      ctx.save();
      ctx.translate(p.x, p.y + 4);
      ctx.rotate(armAngle);
      ctx.fillStyle = "#f97316";
      ctx.fillRect(0, -5, p.w, 10);
      ctx.fillStyle = "#111827";
      for (let i = 8; i < p.w; i += 16) {
        ctx.fillRect(i, -5, 8, 10);
      }
      ctx.restore();
    }
  });
}

function drawSegment(
  ctx: CanvasRenderingContext2D,
  seg: SegmentState,
  isDrive: boolean,
  speed: number,
  braking: boolean
) {
  ctx.save();
  ctx.translate(seg.x, seg.y);
  ctx.rotate(seg.angle);

  const w = seg.width;
  const l = seg.length;
  const halfW = w / 2;
  const halfL = l / 2;

  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;

  // Wheels
  ctx.fillStyle = "#020617";
  const wheelW = Math.min(12, l * 0.12);
  const wheelH = 4;
  const axles =
    isDrive || seg.role === "rigid"
      ? [-halfL * 0.45, halfL * 0.35]
      : [-halfL * 0.35, halfL * 0.25];
  axles.forEach((ax) => {
    ctx.fillRect(ax - wheelW / 2, -halfW - 1, wheelW, wheelH);
    ctx.fillRect(ax - wheelW / 2, halfW - wheelH + 1, wheelW, wheelH);
  });

  if (seg.role === "rigid") {
    const trL = l * 0.7;
    const cabL = l * 0.25;
    const cabX = halfL - cabL;

    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2;
    ctx.fillRect(-halfL, -halfW, trL, w);
    ctx.strokeRect(-halfL, -halfW, trL, w);

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#0f172a";
    roundRect(ctx, cabX, -halfW + 1, cabL, w - 2, 3);
    ctx.fill();

    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.moveTo(halfL - 5, -halfW + 3);
    ctx.quadraticCurveTo(halfL, 0, halfL - 5, halfW - 3);
    ctx.lineTo(halfL - 2, halfW - 5);
    ctx.quadraticCurveTo(halfL + 1, 0, halfL - 2, -halfW + 5);
    ctx.fill();

    ctx.fillStyle = "#fef08a";
    ctx.fillRect(halfL - 2, -halfW + 3, 2, 4);
    ctx.fillRect(halfL - 2, halfW - 7, 2, 4);

    if (speed >= -0.1) {
      const beam = ctx.createLinearGradient(halfL, 0, halfL + 120, 0);
      beam.addColorStop(0, "rgba(253, 224, 71, 0.28)");
      beam.addColorStop(1, "rgba(253, 224, 71, 0)");
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(halfL, -halfW + 3);
      ctx.lineTo(halfL + 120, -halfW - 30);
      ctx.lineTo(halfL + 120, halfW + 30);
      ctx.lineTo(halfL, halfW - 3);
      ctx.fill();
    }

    ctx.fillStyle = braking ? "#ef4444" : "#7f1d1d";
    ctx.fillRect(-halfL, -halfW + 2, 3, 6);
    ctx.fillRect(-halfL, halfW - 8, 3, 6);
  } else if (seg.role === "cab") {
    ctx.fillStyle = "#0f172a";
    roundRect(ctx, -halfL, -halfW + 1, l, w - 2, 4);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.moveTo(halfL - 4, -halfW + 3);
    ctx.quadraticCurveTo(halfL + 1, 0, halfL - 4, halfW - 3);
    ctx.fill();
    ctx.fillStyle = "#fef08a";
    ctx.fillRect(halfL - 2, -halfW + 3, 2, 4);
    ctx.fillRect(halfL - 2, halfW - 7, 2, 4);
    if (speed >= -0.1) {
      const beam = ctx.createLinearGradient(halfL, 0, halfL + 100, 0);
      beam.addColorStop(0, "rgba(253, 224, 71, 0.25)");
      beam.addColorStop(1, "rgba(253, 224, 71, 0)");
      ctx.fillStyle = beam;
      ctx.fillRect(halfL, -halfW - 20, 100, w + 40);
    }
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2;
    ctx.fillRect(-halfL, -halfW, l, w);
    ctx.strokeRect(-halfL, -halfW, l, w);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#e2e8f0";
    for (let i = 4; i < l - 4; i += 5) {
      ctx.beginPath();
      ctx.moveTo(-halfL + i, -halfW + 1);
      ctx.lineTo(-halfL + i, halfW - 1);
      ctx.stroke();
    }
    ctx.fillStyle = braking && !isDrive ? "#ef4444" : "#7f1d1d";
    ctx.fillRect(-halfL, -halfW + 2, 3, 6);
    ctx.fillRect(-halfL, halfW - 8, 3, 6);
    ctx.fillStyle = "#64748b";
    ctx.beginPath();
    ctx.arc(halfL - 2, 0, 3, 0, Math.PI * 2);
    ctx.fill();
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
