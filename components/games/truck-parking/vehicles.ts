import type { VehicleDef, VehicleId } from "./types";

export const VEHICLES: Record<VehicleId, VehicleDef> = {
  rigid: {
    id: "rigid",
    label: "Контейнеровоз",
    hint: "Жорсткий кузов — як у демо HTML",
    segments: [{ length: 100, width: 34, role: "rigid" }],
    maxHitchAngle: 0,
    maxSpeed: 3.5,
    minSpeed: -2,
    acceleration: 0.05,
    friction: 0.94,
    brakeForce: 0.2,
    maxSteering: 0.035,
  },
  tractor_semi: {
    id: "tractor_semi",
    label: "Тягач + напівпричіп",
    hint: "Шарнір у зчепленні",
    segments: [
      { length: 42, width: 32, role: "cab" },
      { length: 78, width: 34, role: "trailer" },
    ],
    maxHitchAngle: 0.85,
    maxSpeed: 3.2,
    minSpeed: -1.8,
    acceleration: 0.048,
    friction: 0.94,
    brakeForce: 0.2,
    maxSteering: 0.04,
  },
  b_double: {
    id: "b_double",
    label: "B-double",
    hint: "Тягач + два причепи",
    segments: [
      { length: 40, width: 32, role: "cab" },
      { length: 56, width: 34, role: "trailer" },
      { length: 56, width: 34, role: "trailer" },
    ],
    maxHitchAngle: 0.75,
    maxSpeed: 2.8,
    minSpeed: -1.5,
    acceleration: 0.042,
    friction: 0.94,
    brakeForce: 0.22,
    maxSteering: 0.042,
  },
};

export const VEHICLE_LIST = Object.values(VEHICLES);

export function totalVehicleLength(def: VehicleDef): number {
  return def.segments.reduce((sum, s) => sum + s.length, 0);
}

export function maxVehicleWidth(def: VehicleDef): number {
  return Math.max(...def.segments.map((s) => s.width));
}
