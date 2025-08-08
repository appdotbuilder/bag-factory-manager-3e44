import { db } from '../db';
import { bagsTable } from '../db/schema';
import { type DeleteBagInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteBag = async (input: DeleteBagInput): Promise<boolean> => {
  try {
    // Delete the bag with the specified ID
    const result = await db.delete(bagsTable)
      .where(eq(bagsTable.id, input.id))
      .execute();

    // Check if any rows were affected (bag existed and was deleted)
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Bag deletion failed:', error);
    throw error;
  }
};