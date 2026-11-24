# FitPriceText (2026-11-24)

Console spam was `flushSync` in FitPriceText on every ProductCard.

Final approach: continuous `transform: scale(min(1, available/needed))` with floor 0.82; measure `scrollWidth` vs wrap `clientWidth`; ResizeObserver → rAF. No flushSync, no tier state, no rem probes.

Next MCP get_errors: clean after fix.