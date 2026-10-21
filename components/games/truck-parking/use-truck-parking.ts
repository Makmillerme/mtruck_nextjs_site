"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HUB_MAP, solidObstacles, spotForVehicle } from "./map-hub";
import {
  allSegmentsInSpot,
  checkCollision,
  parkingAlignment,
  reboundAfterCrash,
  scoreParking,
  spawnSegments,
  stepDrive,
  type DriveState,
} from "./physics";
import type {
  GamePhase,
  GameSnapshot,
  InputKeys,
  ParkingSpot,
  VehicleId,
} from "./types";
import { VEHICLES } from "./vehicles";

const HOLD_SECONDS = 4;
const emptyKeys = (): InputKeys => ({
  up: false,
  down: false,
  left: false,
  right: false,
  brake: false,
});

function emptySnapshot(vehicleId: VehicleId): GameSnapshot {
  return {
    phase: "menu",
    parkingTimer: HOLD_SECONDS,
    parkingHoldSeconds: HOLD_SECONDS,
    score: null,
    segments: [],
    speed: 0,
    vehicleId,
    spot: HUB_MAP.baseSpot,
    camX: HUB_MAP.start.x,
    camY: HUB_MAP.start.y,
  };
}

export function useTruckParking(selectedVehicle: VehicleId) {
  const keysRef = useRef<InputKeys>(emptyKeys());
  const driveRef = useRef<DriveState | null>(null);
  const spotRef = useRef<ParkingSpot>(HUB_MAP.baseSpot);
  const phaseRef = useRef<GamePhase>("menu");
  const parkingTimerRef = useRef(HOLD_SECONDS);
  const lastTimeRef = useRef(0);
  const rafRef = useRef<number>(0);
  const runningRef = useRef(false);
  const vehicleRef = useRef(selectedVehicle);

  const [snapshot, setSnapshot] = useState<GameSnapshot>(() =>
    emptySnapshot(selectedVehicle)
  );

  const scoreRef = useRef<number | null>(null);

  const publishFull = useCallback(() => {
    const drive = driveRef.current;
    const lead = drive?.segments[0];
    setSnapshot({
      phase: phaseRef.current,
      parkingTimer: parkingTimerRef.current,
      parkingHoldSeconds: HOLD_SECONDS,
      score: scoreRef.current,
      segments: drive?.segments ?? [],
      speed: drive?.speed ?? 0,
      vehicleId: vehicleRef.current,
      spot: spotRef.current,
      camX: lead?.x ?? HUB_MAP.start.x,
      camY: lead?.y ?? HUB_MAP.start.y,
    });
  }, []);

  const stopLoop = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
  }, []);

  const tick = useCallback(
    (now: number) => {
      if (!runningRef.current) return;
      const dt = Math.min(40, now - lastTimeRef.current);
      lastTimeRef.current = now;

      const def = VEHICLES[vehicleRef.current];
      let drive = driveRef.current;
      if (!drive) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (phaseRef.current === "playing" || phaseRef.current === "parking") {
        drive = stepDrive(def, drive, keysRef.current);
        driveRef.current = drive;

        const solids = solidObstacles(HUB_MAP);
        if (checkCollision(drive.segments, solids)) {
          drive = reboundAfterCrash(drive);
          driveRef.current = drive;
        }

        const spot = spotRef.current;
        const { aligned, angleDiff } = parkingAlignment(
          drive.segments[0]?.angle ?? 0,
          spot
        );
        const inside = allSegmentsInSpot(drive.segments, spot);
        const stopped = Math.abs(drive.speed) < 0.12;

        if (inside && aligned && stopped) {
          if (phaseRef.current === "playing") {
            phaseRef.current = "parking";
            parkingTimerRef.current = HOLD_SECONDS;
          }
          parkingTimerRef.current -= dt / 1000;
          if (parkingTimerRef.current <= 0) {
            parkingTimerRef.current = 0;
            phaseRef.current = "won";
            scoreRef.current = scoreParking(drive.segments, spot, angleDiff);
            stopLoop();
            publishFull();
            return;
          }
        } else if (phaseRef.current === "parking") {
          phaseRef.current = "playing";
          parkingTimerRef.current = HOLD_SECONDS;
        }
      }

      publishFull();
      rafRef.current = requestAnimationFrame(tick);
    },
    [publishFull, stopLoop]
  );

  const startGame = useCallback(
    (vehicleId: VehicleId) => {
      vehicleRef.current = vehicleId;
      const def = VEHICLES[vehicleId];
      const spot = spotForVehicle(HUB_MAP, def);
      spotRef.current = spot;
      driveRef.current = {
        speed: 0,
        steeringAngle: 0,
        segments: spawnSegments(
          def,
          HUB_MAP.start.x,
          HUB_MAP.start.y,
          HUB_MAP.start.angle
        ),
      };
      parkingTimerRef.current = HOLD_SECONDS;
      scoreRef.current = null;
      phaseRef.current = "playing";
      keysRef.current = emptyKeys();
      lastTimeRef.current = performance.now();
      stopLoop();
      runningRef.current = true;
      publishFull();
      rafRef.current = requestAnimationFrame(tick);
    },
    [publishFull, stopLoop, tick]
  );

  const returnToMenu = useCallback(() => {
    stopLoop();
    phaseRef.current = "menu";
    driveRef.current = null;
    scoreRef.current = null;
    parkingTimerRef.current = HOLD_SECONDS;
    publishFull();
  }, [publishFull, stopLoop]);

  const setKey = useCallback((partial: Partial<InputKeys>, down: boolean) => {
    const next = { ...keysRef.current };
    (Object.keys(partial) as (keyof InputKeys)[]).forEach((k) => {
      if (partial[k]) next[k] = down;
    });
    keysRef.current = next;
  }, []);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      const k = e.key;
      if (["ArrowUp", "w", "W"].includes(k)) {
        keysRef.current.up = true;
        e.preventDefault();
      }
      if (["ArrowDown", "s", "S"].includes(k)) {
        keysRef.current.down = true;
        e.preventDefault();
      }
      if (["ArrowLeft", "a", "A"].includes(k)) {
        keysRef.current.left = true;
        e.preventDefault();
      }
      if (["ArrowRight", "d", "D"].includes(k)) {
        keysRef.current.right = true;
        e.preventDefault();
      }
      if (k === " " || k === "Spacebar") {
        keysRef.current.brake = true;
        e.preventDefault();
      }
    };
    const onUp = (e: KeyboardEvent) => {
      const k = e.key;
      if (["ArrowUp", "w", "W"].includes(k)) keysRef.current.up = false;
      if (["ArrowDown", "s", "S"].includes(k)) keysRef.current.down = false;
      if (["ArrowLeft", "a", "A"].includes(k)) keysRef.current.left = false;
      if (["ArrowRight", "d", "D"].includes(k)) keysRef.current.right = false;
      if (k === " " || k === "Spacebar") keysRef.current.brake = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      stopLoop();
    };
  }, [stopLoop]);

  useEffect(() => {
    if (phaseRef.current === "menu") {
      vehicleRef.current = selectedVehicle;
    }
  }, [selectedVehicle]);

  return {
    snapshot,
    map: HUB_MAP,
    startGame,
    returnToMenu,
    setKey,
    holdSeconds: HOLD_SECONDS,
  };
}
