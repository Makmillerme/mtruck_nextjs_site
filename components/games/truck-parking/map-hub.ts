import type { MapDef, ParkingSpot, VehicleDef } from "./types";
import { maxVehicleWidth, totalVehicleLength } from "./vehicles";

/** World size — camera shows a fixed viewport into this. */
export const WORLD_W = 2400;
export const WORLD_H = 1400;
export const VIEW_W = 800;
export const VIEW_H = 500;

/** Logistics corridor: village → city → park → terminal → warehouse yard. */
export const HUB_MAP: MapDef = {
  width: WORLD_W,
  height: WORLD_H,
  viewWidth: VIEW_W,
  viewHeight: VIEW_H,
  start: { x: 160, y: 980, angle: 0 },
  baseSpot: {
    // Perpendicular bay under warehouse ramp opening
    x: 1980,
    y: 120,
    width: 130,
    height: 52,
    angle: Math.PI / 2,
  },
  biomes: [
    { kind: "village", x: 0, y: 0, w: 520, h: WORLD_H },
    { kind: "city", x: 520, y: 0, w: 560, h: WORLD_H },
    { kind: "park", x: 1080, y: 0, w: 480, h: WORLD_H },
    { kind: "terminal", x: 1560, y: 0, w: 280, h: WORLD_H },
    { kind: "yard", x: 1840, y: 0, w: 560, h: WORLD_H },
  ],
  roads: [
    // Main corridor west → east through biomes
    { x1: 40, y1: 980, x2: 1880, y2: 980, width: 96, arrows: true },
    // Village north spur
    { x1: 200, y1: 720, x2: 200, y2: 980, width: 72, arrows: true },
    // City cross street
    { x1: 780, y1: 560, x2: 780, y2: 1100, width: 80, arrows: true },
    // Park loop feeder
    { x1: 1280, y1: 700, x2: 1280, y2: 980, width: 72, arrows: true },
    // Terminal approach north into gate
    { x1: 1700, y1: 720, x2: 1700, y2: 980, width: 88, arrows: true },
    // Yard east–west after gate
    { x1: 1700, y1: 720, x2: 2200, y2: 720, width: 96, arrows: true },
    // Ramp approach north to P
    { x1: 2045, y1: 160, x2: 2045, y2: 720, width: 100, arrows: true },
    // Parallel parking access (yard south)
    { x1: 1880, y1: 1120, x2: 2320, y2: 1120, width: 72, arrows: false },
  ],
  path: [
    { x: 160, y: 980 },
    { x: 780, y: 980 },
    { x: 1280, y: 980 },
    { x: 1700, y: 980 },
    { x: 1700, y: 720 },
    { x: 2045, y: 720 },
    { x: 2045, y: 200 },
  ],
  barrier: { x: 1656, y: 686, w: 88, h: 18 },
  obstacles: [
    // Warehouse walls with ramp gap (~x 1970–2120)
    { x: 1860, y: 40, width: 110, height: 130, type: "warehouse" },
    { x: 2120, y: 40, width: 240, height: 130, type: "warehouse" },
    { x: 1970, y: 40, width: 150, height: 22, type: "warehouse_back" },
    // City blocks
    { x: 560, y: 200, width: 160, height: 220, type: "building" },
    { x: 880, y: 180, width: 140, height: 200, type: "building" },
    { x: 600, y: 1120, width: 180, height: 140, type: "building" },
    // Terminal office
    { x: 1580, y: 520, width: 100, height: 120, type: "building" },
    // Yard office
    { x: 2260, y: 400, width: 100, height: 90, type: "building" },
    // World bounds
    { x: -16, y: 0, width: 16, height: WORLD_H, type: "wall" },
    { x: WORLD_W, y: 0, width: 16, height: WORLD_H, type: "wall" },
    { x: 0, y: WORLD_H, width: WORLD_W, height: 16, type: "wall" },
    { x: 0, y: -12, width: WORLD_W, height: 12, type: "wall" },
  ],
  parkedTrucks: [
    // Vertical bay row left of ramp (aligned)
    { x: 1888, y: 95, width: 36, height: 108, type: "parked_truck_vert" },
    { x: 1934, y: 95, width: 36, height: 108, type: "parked_truck_vert" },
    // Right of ramp
    { x: 2130, y: 95, width: 36, height: 108, type: "parked_truck_vert" },
    { x: 2176, y: 95, width: 36, height: 108, type: "parked_truck_vert" },
    { x: 2222, y: 95, width: 36, height: 108, type: "parked_truck_vert" },
    // Parallel street parking south yard
    { x: 1920, y: 1090, width: 120, height: 36, type: "parked_truck_horiz" },
    { x: 2070, y: 1090, width: 120, height: 36, type: "parked_truck_horiz" },
    { x: 2220, y: 1090, width: 120, height: 36, type: "parked_truck_horiz" },
  ],
  decorations: [
    // Vertical bay guide lines (left cluster)
    { type: "yellow_line", x: 1884, y: 175, w: 3, h: 70 },
    { type: "yellow_line", x: 1930, y: 175, w: 3, h: 70 },
    { type: "yellow_line", x: 1976, y: 175, w: 3, h: 70 },
    // Right cluster
    { type: "yellow_line", x: 2126, y: 175, w: 3, h: 70 },
    { type: "yellow_line", x: 2172, y: 175, w: 3, h: 70 },
    { type: "yellow_line", x: 2218, y: 175, w: 3, h: 70 },
    { type: "yellow_line", x: 2264, y: 175, w: 3, h: 70 },
    // Parallel bay zones
    { type: "zone", x: 1908, y: 1078, w: 140, h: 56 },
    { type: "zone", x: 2058, y: 1078, w: 140, h: 56 },
    { type: "zone", x: 2208, y: 1078, w: 140, h: 56 },
  ],
  props: [
    // Village houses + fence
    { kind: "house", x: 60, y: 760, w: 70, h: 55 },
    { kind: "house", x: 280, y: 740, w: 80, h: 60 },
    { kind: "house", x: 90, y: 1080, w: 75, h: 58 },
    { kind: "fence", x: 40, y: 840, w: 140, h: 8 },
    { kind: "tree", x: 360, y: 860, w: 28, h: 28 },
    { kind: "tree", x: 420, y: 1100, w: 32, h: 32 },
    // City signs
    { kind: "sign", x: 740, y: 900, w: 18, h: 40 },
    { kind: "sign", x: 900, y: 900, w: 18, h: 40 },
    // Park trees + benches
    { kind: "tree", x: 1140, y: 820, w: 36, h: 36 },
    { kind: "tree", x: 1220, y: 860, w: 40, h: 40 },
    { kind: "tree", x: 1360, y: 800, w: 34, h: 34 },
    { kind: "tree", x: 1420, y: 1080, w: 38, h: 38 },
    { kind: "tree", x: 1180, y: 1120, w: 30, h: 30 },
    { kind: "bench", x: 1300, y: 880, w: 40, h: 14 },
    { kind: "bench", x: 1400, y: 900, w: 40, h: 14 },
    // Terminal booth + barrier prop (drawn animated separately too)
    { kind: "booth", x: 1588, y: 680, w: 48, h: 40 },
    { kind: "barrier", x: 1656, y: 686, w: 88, h: 10 },
    { kind: "sign", x: 1640, y: 640, w: 22, h: 36 },
  ],
};

export function solidObstacles(map: MapDef = HUB_MAP) {
  return [...map.obstacles, ...map.parkedTrucks];
}

/** Scale parking spot to fit selected vehicle length/width. */
export function spotForVehicle(
  map: MapDef,
  vehicle: VehicleDef
): ParkingSpot {
  const base = map.baseSpot;
  const len = totalVehicleLength(vehicle);
  const width = maxVehicleWidth(vehicle);
  const spotAlong = Math.max(base.width, len + 24);
  const spotAcross = Math.max(base.height, width + 14);
  const cx = base.x + base.width / 2;
  const cy = base.y + base.height / 2;
  return {
    x: cx - spotAlong / 2,
    y: cy - spotAcross / 2,
    width: spotAlong,
    height: spotAcross,
    angle: base.angle,
  };
}

/** Clamp camera so viewport stays inside world. */
export function cameraOrigin(
  leadX: number,
  leadY: number,
  map: MapDef = HUB_MAP
): { x: number; y: number } {
  const halfW = map.viewWidth / 2;
  const halfH = map.viewHeight / 2;
  return {
    x: Math.max(0, Math.min(map.width - map.viewWidth, leadX - halfW)),
    y: Math.max(0, Math.min(map.height - map.viewHeight, leadY - halfH)),
  };
}
