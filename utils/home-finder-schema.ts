import { z } from "zod";

export const updateHomeFinderSettingsSchema = z.object({
  showRootsBlock: z.boolean(),
  rootIds: z.array(z.string().min(1)).max(50),
  defaultRootId: z.string().min(1).nullable(),
  defaultChildId: z.string().min(1).nullable(),
});

export type UpdateHomeFinderSettingsInput = z.infer<
  typeof updateHomeFinderSettingsSchema
>;
