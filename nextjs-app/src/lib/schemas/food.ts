import { z } from 'zod';

export const foodEntrySchema = z.object({
  id: z.string().uuid("Must provide a client-generated UUID for idempotency"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  name: z.string().min(1, "Name is required").max(200),
  brand: z.string().nullable().optional(),
  grams: z.number().int().positive().max(10000),
  caloriesPer100g: z.number().nonnegative().max(10000),
  proteinPer100g: z.number().nonnegative().max(100).default(0),
  carbsPer100g: z.number().nonnegative().max(100).default(0),
  fatPer100g: z.number().nonnegative().max(100).default(0),
  isCustom: z.boolean().default(false),
});

export type FoodEntryPayload = z.infer<typeof foodEntrySchema>;
