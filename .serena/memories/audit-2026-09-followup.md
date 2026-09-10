# Flicker / scroll restore (2026-09-09)

Reload no longer restores last scroll (manual restoration). Header glass is CSS-first. Homepage catalog waits for real cards (Suspense fallback is empty pastel, not skeletons). `/products/loading.tsx` removed; ProductsContainer no inner Suspense. CategoryFinder brand chips do not fade in.

Verified: reload from catalog Y=900 → Y=0, header dark on hero and partnership (`rgba(0,0,0,0.25)`), light on catalog.
