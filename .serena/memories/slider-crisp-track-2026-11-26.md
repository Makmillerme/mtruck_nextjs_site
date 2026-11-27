Superseded by `mem:slider-device-pixel-quantize-2026-11-27`.

Earlier crisp track only snapped phase via `top` / `--slider-snap` and kept height at 6 CSS px. That left fractional device-pixel coverage on many DPR values. Current canon: quantize height to whole device pixels near 6 CSS px, then `translateY` for phase (not `top`).