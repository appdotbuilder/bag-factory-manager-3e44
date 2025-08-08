import { db } from '../db';
import { bagsTable } from '../db/schema';
import { type Bag } from '../schema';

export const getBags = async (): Promise<Bag[]> => {
  try {
    // Fetch all bags from database
    const results = await db.select()
      .from(bagsTable)
      .execute();

    // Return bags (no numeric conversions needed as quantity is integer)
    return results;
  } catch (error) {
    console.error('Failed to fetch bags:', error);
    throw error;
  }
};