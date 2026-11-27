Slider track thickness (2026-11-27).

Root cause: track was always `h-[6px]`. `useCrispTrack` only shifted via `top`/`--slider-snap` and never changed height. 6 CSS px maps to a non-integer device-pixel count on many DPR values (1.25 → 7.5, 1.75 → 10.5, 2.75 → 16.5), so antialiasing made the line look thicker/thinner across screens. `top` also moved layout inside flex `items-center`, so two tracks on one page could diverge.

Fix in `components/ui/slider.tsx` only (shared by financing calculator + catalog range facets):
- `quantizedHeightCss(dpr)` → `max(1, round(6 * dpr)) / dpr` (DPR 1.25 → 6.4px / 8 device px).
- Set `track.style.height`, clear transform, measure, then `translateY` so the top edge sits on a device-pixel boundary. Same `--slider-snap` on thumb via `translate-y-[var(--slider-snap)]` (not `top`).
- Hit area `py-3 -my-3` and thumb layout `h-4 w-4` unchanged.

Verified at DPR 1.25: financing pair both 6.4px / 8 device px; catalog filter 9 tracks all 6.4px / 8 device px.

Phone preview: `.cursor/scripts/phone-dev.ps1` (Adb). When last run, adb started but no authorized device — user must plug USB, enable debugging, accept prompt, then re-run the script. Phone URL: `http://localhost:3000`. Do not add adb into package.json/app.
