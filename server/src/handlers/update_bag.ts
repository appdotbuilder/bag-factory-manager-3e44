import { db } from '../db';
import { bagsTable } from '../db/schema';
import { type UpdateBagInput, type Bag } from '../schema';
import { eq } from 'drizzle-orm';

export const updateBag = async (input: UpdateBagInput): Promise<Bag | null> => {
  try {
    // First check if the bag exists
    const existingBag = await db.select()
      .from(bagsTable)
      .where(eq(bagsTable.id, input.id))
      .execute();

    if (existingBag.length === 0) {
      return null; // Bag not found
    }

    // Build update object with only provided fields
    const updateData: Partial<typeof bagsTable.$inferInsert> = {};
    
    if (input.type !== undefined) {
      updateData.type = input.type;
    }
    if (input.color !== undefined) {
      updateData.color = input.color;
    }
    if (input.material !== undefined) {
      updateData.material = input.material;
    }
    if (input.quantity !== undefined) {
      updateData.quantity = input.quantity;
    }

    // If no fields to update, return the existing bag
    if (Object.keys(updateData).length === 0) {
      return existingBag[0];
    }

    // Update the bag
    const result = await db.update(bagsTable)
      .set(updateData)
      .where(eq(bagsTable.id, input.id))
      .returning()
      .execute();

    return result[0] || null;
  } catch (error) {
    console.error('Bag update failed:', error);
    throw error;
  }
};