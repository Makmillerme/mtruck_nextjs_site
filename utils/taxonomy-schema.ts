import { z } from "zod";

const optionalUuid = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined))
  .pipe(z.string().uuid().optional());

export const createTaxonomyNodeSchema = z.object({
  name: z.string().trim().min(2).max(80),
  parentId: optionalUuid,
});

export const renameTaxonomyNodeSchema = z.object({
  nodeId: z.string().uuid(),
  name: z.string().trim().min(2).max(80),
});

export const nodeIdSchema = z.object({
  nodeId: z.string().uuid(),
});

export const moveTaxonomyNodeSchema = z.object({
  nodeId: z.string().uuid(),
  direction: z.enum(["up", "down"]),
});

export const createAttributeSchema = z.object({
  taxonomyNodeId: z.string().uuid(),
  name: z.string().trim().min(2).max(80),
  key: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  type: z.enum(["SELECT", "NUMBER", "TEXT", "BOOLEAN", "YEAR"]),
  dependsOnAttributeId: optionalUuid,
  unit: z
    .string()
    .trim()
    .max(24)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  isRequired: z.coerce.boolean().optional().default(false),
  isFacet: z.coerce.boolean().optional().default(false),
  isIdentity: z.coerce.boolean().optional().default(false),
});

export const updateAttributeFlagsSchema = z.object({
  attributeId: z.string().uuid(),
  name: z.string().trim().min(2).max(80),
  unit: z
    .string()
    .trim()
    .max(24)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  isRequired: z.coerce.boolean().optional().default(false),
  isFacet: z.coerce.boolean().optional().default(false),
  isIdentity: z.coerce.boolean().optional().default(false),
});

export const attributeIdSchema = z.object({
  attributeId: z.string().uuid(),
});

export const createAttributeOptionSchema = z.object({
  attributeId: z.string().uuid(),
  label: z.string().trim().min(1).max(80),
  parentOptionId: optionalUuid,
});

export const optionIdSchema = z.object({
  optionId: z.string().uuid(),
});
