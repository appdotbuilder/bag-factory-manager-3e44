import { z } from 'zod';

// Bag schema with proper validation
export const bagSchema = z.object({
  id: z.number(),
  type: z.string(),
  color: z.string(),
  material: z.string(),
  quantity: z.number().int().nonnegative(), // Ensures non-negative integer values
  created_at: z.coerce.date() // Automatically converts string timestamps to Date objects
});

export type Bag = z.infer<typeof bagSchema>;

// Input schema for creating bags
export const createBagInputSchema = z.object({
  type: z.string().min(1), // Ensure non-empty string
  color: z.string().min(1), // Ensure non-empty string
  material: z.string().min(1), // Ensure non-empty string
  quantity: z.number().int().nonnegative() // Validate that quantity is non-negative integer
});

export type CreateBagInput = z.infer<typeof createBagInputSchema>;

// Input schema for updating bags
export const updateBagInputSchema = z.object({
  id: z.number(),
  type: z.string().min(1).optional(), // Optional = field can be undefined (omitted)
  color: z.string().min(1).optional(),
  material: z.string().min(1).optional(),
  quantity: z.number().int().nonnegative().optional()
});

export type UpdateBagInput = z.infer<typeof updateBagInputSchema>;

// Schema for getting a bag by ID
export const getBagInputSchema = z.object({
  id: z.number()
});

export type GetBagInput = z.infer<typeof getBagInputSchema>;

// Schema for deleting a bag by ID
export const deleteBagInputSchema = z.object({
  id: z.number()
});

export type DeleteBagInput = z.infer<typeof deleteBagInputSchema>;