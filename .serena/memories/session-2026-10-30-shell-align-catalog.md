# Shell align to catalog — 2026-10-30

User: side margins on catalog `/products` are the only correct ones; home/PDP felt unchanged/wrong after gutter-only tweak.

Root cause: `--shell-home: 1360` / `--shell-product: 1520` capped content narrower than catalog 1920 → extra empty side space on wide viewports (looked like different page gutters).

Fix: set `--shell-home` and `--shell-product` to **1920px** (same as catalog). Reading 1280 unchanged. Gutters unchanged.
