# Product name = classic Input (2026-10-30)

- Sheet no longer uses ProductNameInput chips.
- Always `Input` (same canon as price).
- If name template exists: auto-fills from `resolveDisplayGroupString` when field empty or still equals last auto value; user edit sets touched and stops overwrite until they clear / match again.
- Server create/update: prefer form `name`; fallback to template compose only if empty.
- Settings gear still configures which fields compose the suggested name.
