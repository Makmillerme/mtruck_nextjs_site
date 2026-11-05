# Session 2026-11-04 — PDP gallery height align + thumb ring + Pusher form

## Layout fix
Height match buybox again without gap above thumbs:
- Column: `h-full` restored on product page gallery wrapper + `flex-1` on PhotoCarousel.
- Page multi wrapper: `flex h-full min-h-0 flex-col gap-3` (not CSS grid stretch).
- Stage/Carousel: `flex-1 min-h-0`, slides `absolute inset-0` when `variant==="page"`.
- Thumbs: `shrink-0` + `p-0.5` so active border/ring is not clipped by overflow.

## Lightbox
Sidebar thumbs already use `.app-scroll` (canon thin scrollbar).

## Pusher create app (advice given)
- Name: `mtruck_site`
- Cluster: `eu`
- Multiple environments: off for now
- Front end: **React**
- Back end: **Node.js**
