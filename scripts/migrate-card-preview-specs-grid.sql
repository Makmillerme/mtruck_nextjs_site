-- Unify CardPreviewSpecsStyle to GRID | TAGS + specsGridCount + showSpecs.
-- Safe to re-run on already-migrated DBs (IF NOT EXISTS / checks).

ALTER TABLE "CardPreviewLayout"
  ADD COLUMN IF NOT EXISTS "showSpecs" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "CardPreviewLayout"
  ADD COLUMN IF NOT EXISTS "specsGridCount" INTEGER NOT NULL DEFAULT 4;

UPDATE "CardPreviewLayout"
SET "specsGridCount" = CASE "specsStyle"::text
  WHEN 'GRID_5' THEN 5
  WHEN 'GRID_6' THEN 6
  WHEN 'GRID' THEN GREATEST(1, LEAST(8, "specsGridCount"))
  ELSE 4
END
WHERE "specsStyle"::text IN ('GRID_4', 'GRID_5', 'GRID_6', 'GRID');

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'CardPreviewSpecsStyle' AND e.enumlabel = 'GRID_4'
  ) THEN
    CREATE TYPE "CardPreviewSpecsStyle_new" AS ENUM ('GRID', 'TAGS');

    ALTER TABLE "CardPreviewLayout"
      ALTER COLUMN "specsStyle" DROP DEFAULT;

    ALTER TABLE "CardPreviewLayout"
      ALTER COLUMN "specsStyle" TYPE "CardPreviewSpecsStyle_new"
      USING (
        CASE "specsStyle"::text
          WHEN 'TAGS' THEN 'TAGS'::"CardPreviewSpecsStyle_new"
          ELSE 'GRID'::"CardPreviewSpecsStyle_new"
        END
      );

    ALTER TABLE "CardPreviewLayout"
      ALTER COLUMN "specsStyle" SET DEFAULT 'GRID'::"CardPreviewSpecsStyle_new";

    DROP TYPE "CardPreviewSpecsStyle";
    ALTER TYPE "CardPreviewSpecsStyle_new" RENAME TO "CardPreviewSpecsStyle";
  END IF;
END $$;
