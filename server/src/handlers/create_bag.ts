import { db } from '../db';
import { bagsTable } from '../db/schema';
import { type CreateBagInput, type Bag } from '../schema';

export const createBag = async (input: CreateBagInput): Promise<Bag> => {
  try {
    // Insert bag record
    const result = await db.insert(bagsTable)
      .values({
        type: input.type,
        color: input.color,
        material: input.material,
        quantity: input.quantity
      })
      .returning()
      .execute();

    // Return the created bag
    const bag = result[0];
    return bag;
  } catch (error) {
    console.error('Bag creation failed:', error);
    throw error;
  }
};