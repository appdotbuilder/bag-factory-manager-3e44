import { db } from '../db';
import { bagsTable } from '../db/schema';
import { type GetBagInput, type Bag } from '../schema';
import { eq } from 'drizzle-orm';

export const getBag = async (input: GetBagInput): Promise<Bag | null> => {
  try {
    // Query for the specific bag by ID
    const result = await db.select()
      .from(bagsTable)
      .where(eq(bagsTable.id, input.id))
      .execute();

    // Return null if no bag found
    if (result.length === 0) {
      return null;
    }

    // Return the first (and only) result
    const bag = result[0];
    return {
      ...bag
    };
  } catch (error) {
    console.error('Bag retrieval failed:', error);
    throw error;
  }
};