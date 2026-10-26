# PDP specs + lightbox viewport rules (2026-10-26)

## Характеристики (`product-specs.tsx` / SpecRows)

Проблема «пустота справа»: label|value були зліва в широкій 1-колонковій картці.

**Канон рядка:** `flex justify-between` + `dd text-right` (label ліворуч, value праворуч на всю ширину комірки).

**Сітка:**
| Viewport | `dl` |
|----------|------|
| &lt; md (640) | 1 колонка, full width |
| ≥ md (768+) | `md:grid-cols-2` |

Не повертати `sm:grid-cols-2` (на ~640 2 колонки тісні). Не тримати лише `lg:` — на планшеті картка знову пустіла.

## Lightbox (`product-lightbox.tsx`)

Проблема «великий відступ зверху»: shell був `sm:h-[min(92vh,56rem)]` → високий stage + landscape `object-contain` = великий letterbox зверху/знизу.

**Канон висоти (width-led):**
| Viewport | Dialog shell |
|----------|----------------|
| &lt; sm | `100dvh` full bleed |
| sm–lg | `h-[min(80vh,36rem)]` max-w-5xl |
| ≥ lg | `h-[min(82vh,40rem)]` max-w-6xl |

Thumbs: `md:grid-cols-[7.5rem_1fr]` (без змін). Stage padding `p-2 sm:p-3`. Zoom toolbar shrink-0 під stage.

Verify @1280: stage≈588px, main img≈564px, top gap ~12px (було сотні px).

## Файли

- `components/single-product/product-specs.tsx`
- `components/single-product/product-lightbox.tsx`
