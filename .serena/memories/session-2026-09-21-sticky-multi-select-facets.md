# Sticky multi-select facets (2026-09-21)

## Проблема
Обрано кілька марок → у «Тип контейнера» не можна обрати кілька значень. Причина: після кліку на один тип narrowing зрізав марки без цього типу → зникали інші типи. Плюс groupIndependentOptions показував типи підписами марок (SCANIA 40' / VOLVO 45') — виглядало як 1:1, дубльовані slug.

## Фікс
- `narrowFacetsForFolder`: sticky — selected незалежних полів не зрізаються cross-facet narrowing (лише CMS schema + `pruneDependentFacetValues` для model→make).
- Selected лишаються у видимих options.
- Прибрано групування незалежних полів по марках (`groupIndependentOptions`); модель і далі групується через `parentSlug`.

Результат: make∈{A,B} AND type∈{40,45} працює як OR всередині кожного ключа.
