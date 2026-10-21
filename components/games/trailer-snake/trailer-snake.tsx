"use client";

import {
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import { VIEW_H, VIEW_W } from "./config";
import { drawTrailerSnake } from "./draw";
import { useTrailerSnake } from "./use-trailer-snake";

export function TrailerSnake({ className }: { className?: string }) {
  const { snapshot, frameRef, startGame, resumeGame, setKey } =
    useTrailerSnake();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const resize = () => {
      const maxW = wrap.clientWidth;
      const aspect = VIEW_W / VIEW_H;
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
      canvas.width = Math.round(VIEW_W * dpr);
      canvas.height = Math.round(VIEW_H * dpr);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let raf = 0;
    const loop = () => {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        drawTrailerSnake(ctx, canvas, frameRef.current, performance.now());
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const inPlay = snapshot.state === "playing";
  const showMenu = snapshot.state === "idle";
  const showPaused = snapshot.state === "paused";
  const showOver = snapshot.state === "gameOver";

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
        <div className="grid gap-1.5">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-primary">
            MTruck
          </p>
          <p className="text-sm font-semibold text-foreground">
            Збір причепів
          </p>
          <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <KbdGroup>
              <Kbd>W</Kbd>
              <Kbd>A</Kbd>
              <Kbd>S</Kbd>
              <Kbd>D</Kbd>
            </KbdGroup>
            <span>газ і кермо</span>
            <Kbd>Space</Kbd>
            <span>гальма</span>
            <Kbd>Esc</Kbd>
            <span>пауза</span>
          </p>
        </div>
        {inPlay || showPaused ? (
          <div className="flex gap-2">
            <div className="rounded-sm border border-border bg-background px-3 py-2 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Причепи
              </p>
              <p className="text-lg font-bold text-foreground">
                {snapshot.score}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div
        ref={wrapRef}
        className="relative flex min-h-[240px] w-full items-center justify-center overflow-hidden rounded-sm border border-border bg-foreground"
      >
        <canvas ref={canvasRef} className="block max-h-full max-w-full" />

        {showMenu ? (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
            <div className="grid w-full max-w-sm gap-4 rounded-sm border border-border bg-background p-5 shadow-lg">
              <div>
                <p className="mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                  MTruck
                </p>
                <h3 className="text-lg font-bold tracking-tight">
                  Контейнеровоз
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Збирайте білі контейнери на майданчику — кожен чіпляється
                  ззаду. Не врізайтесь у свій состав і в край карти.
                </p>
              </div>
              <Button type="button" className="w-full" onClick={startGame}>
                Старт
              </Button>
            </div>
          </div>
        ) : null}

        {showPaused ? (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
            <div className="grid w-full max-w-xs gap-3 rounded-sm border border-border bg-background p-5 text-center shadow-lg">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                MTruck
              </p>
              <p className="text-lg font-bold">Пауза</p>
              <Button type="button" onClick={resumeGame} className="w-full">
                Продовжити
              </Button>
            </div>
          </div>
        ) : null}

        {showOver ? (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
            <div className="grid w-full max-w-sm gap-4 rounded-sm border border-border bg-background p-5 text-center shadow-lg">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Рекорд
              </p>
              <p className="text-3xl font-bold text-foreground">
                {snapshot.score}
              </p>
              <p className="text-lg font-bold">Состав розірвано</p>
              <p className="text-sm text-muted-foreground">
                Зібрано причепів: {snapshot.score}
              </p>
              {snapshot.highscores.length > 0 ? (
                <ul className="grid gap-1 text-left text-xs text-muted-foreground">
                  {snapshot.highscores.map((h, i) => (
                    <li
                      key={`${h.score}-${h.date}-${i}`}
                      className="flex justify-between"
                    >
                      <span className="font-bold text-foreground">{h.score}</span>
                      <span>{h.date}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <Button type="button" onClick={startGame} className="w-full">
                Ще раз
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
              Тихіше
            </Button>
            <Button
              type="button"
              className="h-14 touch-none"
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
