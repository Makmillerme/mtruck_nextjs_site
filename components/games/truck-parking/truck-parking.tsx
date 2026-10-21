"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { drawScene } from "./draw";
import type { VehicleId } from "./types";
import { useTruckParking } from "./use-truck-parking";
import { VEHICLE_LIST } from "./vehicles";

export function TruckParking({ className }: { className?: string }) {
  const [vehicleId, setVehicleId] = useState<VehicleId>("rigid");
  const {
    snapshot,
    map,
    startGame,
    returnToMenu,
    setKey,
    holdSeconds,
  } = useTruckParking(vehicleId);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const resize = () => {
      const maxW = wrap.clientWidth;
      const aspect = map.viewWidth / map.viewHeight;
      const maxH = Math.min(420, wrap.clientWidth / aspect);
      let w = maxW;
      let h = maxW / aspect;
      if (h > maxH) {
        h = maxH;
        w = maxH * aspect;
      }
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.width = Math.round(map.viewWidth * dpr);
      canvas.height = Math.round(map.viewHeight * dpr);
      paint();
    };

    const paint = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const snap = snapshotRef.current;
      drawScene(
        ctx,
        canvas,
        map,
        snap.spot,
        snap.segments,
        snap.phase,
        snap.speed,
        false,
        performance.now()
      );
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [map]);

  // Continuous paint while playing so path chevrons animate even if state idle
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let raf = 0;
    const loop = () => {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const snap = snapshotRef.current;
        drawScene(
          ctx,
          canvas,
          map,
          snap.spot,
          snap.segments,
          snap.phase,
          snap.speed,
          false,
          performance.now()
        );
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [map]);

  const inPlay =
    snapshot.phase === "playing" || snapshot.phase === "parking";
  const showMenu = snapshot.phase === "menu";
  const showResult = snapshot.phase === "won";

  const bindHold = (partial: Parameters<typeof setKey>[0]) => ({
    onPointerDown: (e: ReactPointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      setKey(partial, true);
    },
    onPointerUp: (e: ReactPointerEvent) => {
      e.preventDefault();
      setKey(partial, false);
    },
    onPointerCancel: () => setKey(partial, false),
  });

  return (
    <div className={cn("relative grid w-full gap-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Маршрут до складу
          </p>
          <p className="text-xs text-muted-foreground">
            WASD / стрілки · Space — гальма · синя стрілка веде до P · hold{" "}
            {holdSeconds} с
          </p>
        </div>
        {inPlay ? (
          <div className="rounded-sm border border-border bg-background px-3 py-2 text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Швидкість
            </p>
            <p className="text-lg font-bold text-foreground">
              {Math.abs(snapshot.speed).toFixed(1)}
            </p>
          </div>
        ) : null}
      </div>

      <div
        ref={wrapRef}
        className="relative flex min-h-[240px] w-full items-center justify-center overflow-hidden rounded-sm border border-border bg-slate-800"
      >
        <canvas ref={canvasRef} className="block max-h-full max-w-full" />

        {snapshot.phase === "parking" ? (
          <div className="pointer-events-none absolute top-4 rounded-sm border border-border bg-background/95 px-4 py-2 text-center shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground">
              Фіксація позиції
            </p>
            <p className="text-xl font-bold text-emerald-600">
              {Math.max(0, snapshot.parkingTimer).toFixed(1)}s
            </p>
            <div className="mt-2 h-1.5 w-36 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-emerald-500 transition-[width] duration-100"
                style={{
                  width: `${((holdSeconds - snapshot.parkingTimer) / holdSeconds) * 100}%`,
                }}
              />
            </div>
          </div>
        ) : null}

        {showMenu ? (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
            <div className="grid w-full max-w-sm gap-4 rounded-sm border border-border bg-background p-5 shadow-lg">
              <div>
                <h3 className="text-lg font-bold tracking-tight">
                  Оберіть техніку
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Проїдіть село → місто → парк → термінал і припаркуйтесь на
                  рампі складу.
                </p>
              </div>
              <div className="grid gap-2">
                {VEHICLE_LIST.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVehicleId(v.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-sm border px-3 py-2.5 text-left text-sm transition-colors",
                      vehicleId === v.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-secondary"
                    )}
                  >
                    <span className="font-medium">{v.label}</span>
                    <span
                      className={cn(
                        "text-xs",
                        vehicleId === v.id
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      )}
                    >
                      {v.hint}
                    </span>
                  </button>
                ))}
              </div>
              <Button
                type="button"
                className="w-full"
                onClick={() => startGame(vehicleId)}
              >
                Старт
              </Button>
            </div>
          </div>
        ) : null}

        {showResult ? (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
            <div className="grid w-full max-w-sm gap-4 rounded-sm border border-border bg-background p-5 text-center shadow-lg">
              <p className="text-3xl font-bold text-foreground">
                {snapshot.score ?? 0}%
              </p>
              <p className="text-lg font-bold">
                {(snapshot.score ?? 0) > 80
                  ? "Ідеальне паркування!"
                  : (snapshot.score ?? 0) > 50
                    ? "Задовільно"
                    : "Могло бути краще"}
              </p>
              <p className="text-sm text-muted-foreground">
                Точність {snapshot.score ?? 0}%
              </p>
              <Button type="button" onClick={returnToMenu} className="w-full">
                Знову обрати техніку
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {inPlay ? (
        <div className="grid gap-2 md:hidden">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-14 touch-none"
              {...bindHold({ left: true })}
            >
              ←
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-14 touch-none"
              {...bindHold({ right: true })}
            >
              →
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-14 touch-none text-destructive"
              {...bindHold({ brake: true })}
            >
              Гальма
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-14 touch-none"
              {...bindHold({ down: true })}
            >
              Назад
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-14 touch-none text-emerald-700"
              {...bindHold({ up: true })}
            >
              Газ
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
