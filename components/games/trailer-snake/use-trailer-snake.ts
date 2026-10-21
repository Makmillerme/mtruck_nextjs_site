"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ATTACH_MS,
  CRUISE_SPEED,
  MAX_HIGHSCORES,
  SPAWN_MS,
  STORAGE_KEY,
  TRAILER,
  WORLD_H,
  WORLD_W,
} from "./config";
import {
  followTrailers,
  hitsOwnConvoy,
  hitsPickup,
  hitsWorldEdge,
  randomPickup,
  spawnCab,
  stepAttach,
  stepDrive,
  type DriveState,
} from "./physics";
import type {
  GameSnapshot,
  GameState,
  HighscoreEntry,
  InputKeys,
  Pickup,
} from "./types";

const emptyKeys = (): InputKeys => ({
  up: false,
  down: false,
  left: false,
  right: false,
  brake: false,
});

function loadScores(): HighscoreEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HighscoreEntry[]) : [];
  } catch {
    return [];
  }
}

function saveScore(score: number, prev: HighscoreEntry[]): HighscoreEntry[] {
  if (score <= 0) return prev;
  const next = [
    ...prev,
    {
      score,
      date: new Date().toLocaleDateString("uk-UA", {
        month: "short",
        day: "numeric",
      }),
    },
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_HIGHSCORES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

function emptySnapshot(highscores: HighscoreEntry[]): GameSnapshot {
  return {
    state: "idle",
    segments: [
      spawnCab(WORLD_W * 0.28, WORLD_H * 0.55, 0),
    ],
    pickup: null,
    speed: 0,
    score: 0,
    highscores,
  };
}

export function useTrailerSnake() {
  const keysRef = useRef<InputKeys>(emptyKeys());
  const driveRef = useRef<DriveState | null>(null);
  const pickupRef = useRef<Pickup | null>(null);
  const stateRef = useRef<GameState>("idle");
  const scoreRef = useRef(0);
  const lastTimeRef = useRef(0);
  const rafRef = useRef(0);
  const runningRef = useRef(false);
  const scoresRef = useRef<HighscoreEntry[]>([]);

  const [snapshot, setSnapshot] = useState<GameSnapshot>(() =>
    emptySnapshot([])
  );

  const frameRef = useRef<GameSnapshot>(emptySnapshot([]));

  const capture = useCallback((): GameSnapshot => {
    const drive = driveRef.current;
    return {
      state: stateRef.current,
      segments: drive?.segments ?? emptySnapshot(scoresRef.current).segments,
      pickup: pickupRef.current,
      speed: drive?.speed ?? 0,
      score: scoreRef.current,
      highscores: scoresRef.current,
    };
  }, []);

  const publish = useCallback(() => {
    const next = capture();
    frameRef.current = next;
    setSnapshot(next);
  }, [capture]);

  const stopLoop = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
  }, []);

  const endGame = useCallback(() => {
    stateRef.current = "gameOver";
    scoresRef.current = saveScore(scoreRef.current, scoresRef.current);
    stopLoop();
    publish();
  }, [publish, stopLoop]);

  const tick = useCallback(
    (now: number) => {
      if (!runningRef.current) return;
      const dt = Math.min(40, now - lastTimeRef.current);
      lastTimeRef.current = now;

      if (stateRef.current === "playing") {
        let drive = driveRef.current;
        if (!drive) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        drive = stepDrive(drive, keysRef.current, dt);
        drive.segments = stepAttach(drive.segments, dt, ATTACH_MS);
        followTrailers(drive.segments);
        driveRef.current = drive;

        const pickup = pickupRef.current;
        if (pickup) {
          pickup.spawnT = Math.min(1, pickup.spawnT + dt / SPAWN_MS);
          const cab = drive.segments[0];
          if (cab && pickup.spawnT > 0.55 && hitsPickup(cab, pickup)) {
            drive.segments.push({
              x: pickup.x,
              y: pickup.y,
              angle: pickup.angle,
              originX: pickup.x,
              originY: pickup.y,
              originAngle: pickup.angle,
              length: TRAILER.length,
              width: TRAILER.width,
              role: "trailer",
              attachT: 0,
            });
            scoreRef.current += 1;
            pickupRef.current = randomPickup(drive.segments, pickup);
            publish();
          }
        }

        if (hitsWorldEdge(drive.segments) || hitsOwnConvoy(drive.segments)) {
          endGame();
          return;
        }
      }

      frameRef.current = capture();
      rafRef.current = requestAnimationFrame(tick);
    },
    [capture, endGame, publish]
  );

  const startGame = useCallback(() => {
    const cab = spawnCab(WORLD_W * 0.28, WORLD_H * 0.55, 0);
    driveRef.current = {
      speed: CRUISE_SPEED,
      steering: 0,
      segments: [cab],
    };
    pickupRef.current = randomPickup([cab], null);
    scoreRef.current = 0;
    stateRef.current = "playing";
    keysRef.current = emptyKeys();
    lastTimeRef.current = performance.now();
    stopLoop();
    runningRef.current = true;
    publish();
    rafRef.current = requestAnimationFrame(tick);
  }, [publish, stopLoop, tick]);

  const pauseGame = useCallback(() => {
    if (stateRef.current !== "playing") return;
    stateRef.current = "paused";
    runningRef.current = false;
    publish();
  }, [publish]);

  const resumeGame = useCallback(() => {
    if (stateRef.current !== "paused") return;
    stateRef.current = "playing";
    lastTimeRef.current = performance.now();
    runningRef.current = true;
    rafRef.current = requestAnimationFrame(tick);
    publish();
  }, [publish, tick]);

  const setKey = useCallback((partial: Partial<InputKeys>, down: boolean) => {
    const next = { ...keysRef.current };
    (Object.keys(partial) as (keyof InputKeys)[]).forEach((k) => {
      if (partial[k]) next[k] = down;
    });
    keysRef.current = next;
  }, []);

  useEffect(() => {
    scoresRef.current = loadScores();
    publish();
  }, [publish]);

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
        if (stateRef.current === "idle" || stateRef.current === "gameOver") {
          startGame();
        } else {
          keysRef.current.brake = true;
        }
        e.preventDefault();
      }
      if (["Escape", "p", "P"].includes(k)) {
        if (stateRef.current === "playing") pauseGame();
        else if (stateRef.current === "paused") resumeGame();
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
    };
  }, [pauseGame, resumeGame, startGame]);

  useEffect(() => () => stopLoop(), [stopLoop]);

  return {
    snapshot,
    frameRef,
    startGame,
    pauseGame,
    resumeGame,
    setKey,
  };
}
