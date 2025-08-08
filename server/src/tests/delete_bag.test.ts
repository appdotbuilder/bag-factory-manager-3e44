import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { bagsTable } from '../db/schema';
import { type DeleteBagInput, type CreateBagInput } from '../schema';
import { deleteBag } from '../handlers/delete_bag';
import { eq } from 'drizzle-orm';

// Test input for creating bags
const testBagInput: CreateBagInput = {
  type: 'Backpack',
  color: 'Blue',
  material: 'Canvas',
  quantity: 5
};

describe('deleteBag', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing bag and return true', async () => {
    // Create a bag first
    const createResult = await db.insert(bagsTable)
      .values({
        type: testBagInput.type,
        color: testBagInput.color,
        material: testBagInput.material,
        quantity: testBagInput.quantity
      })
      .returning()
      .execute();

    const bagId = createResult[0].id;

    // Delete the bag
    const deleteInput: DeleteBagInput = { id: bagId };
    const result = await deleteBag(deleteInput);

    // Should return true for successful deletion
    expect(result).toBe(true);

    // Verify the bag no longer exists in the database
    const bags = await db.select()
      .from(bagsTable)
      .where(eq(bagsTable.id, bagId))
      .execute();

    expect(bags).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent bag', async () => {
    // Try to delete a bag that doesn't exist
    const deleteInput: DeleteBagInput = { id: 999 };
    const result = await deleteBag(deleteInput);

    // Should return false when bag doesn't exist
    expect(result).toBe(false);
  });

  it('should not affect other bags when deleting one bag', async () => {
    // Create multiple bags
    const bag1 = await db.insert(bagsTable)
      .values({
        type: 'Backpack',
        color: 'Blue',
        material: 'Canvas',
        quantity: 5
      })
      .returning()
      .execute();

    const bag2 = await db.insert(bagsTable)
      .values({
        type: 'Tote',
        color: 'Red',
        material: 'Leather',
        quantity: 3
      })
      .returning()
      .execute();

    // Delete only the first bag
    const deleteInput: DeleteBagInput = { id: bag1[0].id };
    const result = await deleteBag(deleteInput);

    expect(result).toBe(true);

    // Verify first bag is deleted
    const deletedBags = await db.select()
      .from(bagsTable)
      .where(eq(bagsTable.id, bag1[0].id))
      .execute();

    expect(deletedBags).toHaveLength(0);

    // Verify second bag still exists
    const remainingBags = await db.select()
      .from(bagsTable)
      .where(eq(bagsTable.id, bag2[0].id))
      .execute();

    expect(remainingBags).toHaveLength(1);
    expect(remainingBags[0].type).toBe('Tote');
    expect(remainingBags[0].color).toBe('Red');
  });

  it('should handle multiple deletions correctly', async () => {
    // Create a bag
    const createResult = await db.insert(bagsTable)
      .values({
        type: testBagInput.type,
        color: testBagInput.color,
        material: testBagInput.material,
        quantity: testBagInput.quantity
      })
      .returning()
      .execute();

    const bagId = createResult[0].id;
    const deleteInput: DeleteBagInput = { id: bagId };

    // First deletion should succeed
    const firstResult = await deleteBag(deleteInput);
    expect(firstResult).toBe(true);

    // Second deletion of same bag should return false (not found)
    const secondResult = await deleteBag(deleteInput);
    expect(secondResult).toBe(false);
  });

  it('should verify database state after deletion', async () => {
    // Create two bags
    await db.insert(bagsTable)
      .values([
        {
          type: 'Backpack',
          color: 'Blue',
          material: 'Canvas',
          quantity: 5
        },
        {
          type: 'Handbag',
          color: 'Black',
          material: 'Leather',
          quantity: 2
        }
      ])
      .execute();

    // Get all bags before deletion
    const bagsBeforeDeletion = await db.select().from(bagsTable).execute();
    expect(bagsBeforeDeletion).toHaveLength(2);

    // Delete one bag
    const bagToDelete = bagsBeforeDeletion[0];
    const deleteInput: DeleteBagInput = { id: bagToDelete.id };
    const result = await deleteBag(deleteInput);

    expect(result).toBe(true);

    // Verify total count decreased
    const bagsAfterDeletion = await db.select().from(bagsTable).execute();
    expect(bagsAfterDeletion).toHaveLength(1);

    // Verify correct bag was deleted
    const remainingBag = bagsAfterDeletion[0];
    expect(remainingBag.id).not.toBe(bagToDelete.id);
    expect(remainingBag.type).toBe('Handbag');
  });
});