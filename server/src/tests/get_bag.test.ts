import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { bagsTable } from '../db/schema';
import { type GetBagInput } from '../schema';
import { getBag } from '../handlers/get_bag';

describe('getBag', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a bag when found', async () => {
    // Create a test bag first
    const testBag = await db.insert(bagsTable)
      .values({
        type: 'Backpack',
        color: 'Blue',
        material: 'Canvas',
        quantity: 5
      })
      .returning()
      .execute();

    const input: GetBagInput = {
      id: testBag[0].id
    };

    const result = await getBag(input);

    // Verify the bag was found and all fields are correct
    expect(result).not.toBeNull();
    expect(result?.id).toEqual(testBag[0].id);
    expect(result?.type).toEqual('Backpack');
    expect(result?.color).toEqual('Blue');
    expect(result?.material).toEqual('Canvas');
    expect(result?.quantity).toEqual(5);
    expect(result?.created_at).toBeInstanceOf(Date);
  });

  it('should return null when bag is not found', async () => {
    const input: GetBagInput = {
      id: 999 // Non-existent ID
    };

    const result = await getBag(input);

    expect(result).toBeNull();
  });

  it('should return the correct bag when multiple bags exist', async () => {
    // Create multiple test bags
    const bag1 = await db.insert(bagsTable)
      .values({
        type: 'Handbag',
        color: 'Red',
        material: 'Leather',
        quantity: 3
      })
      .returning()
      .execute();

    const bag2 = await db.insert(bagsTable)
      .values({
        type: 'Tote',
        color: 'Green',
        material: 'Cotton',
        quantity: 7
      })
      .returning()
      .execute();

    // Query for the second bag specifically
    const input: GetBagInput = {
      id: bag2[0].id
    };

    const result = await getBag(input);

    // Verify we got the correct bag (bag2, not bag1)
    expect(result).not.toBeNull();
    expect(result?.id).toEqual(bag2[0].id);
    expect(result?.type).toEqual('Tote');
    expect(result?.color).toEqual('Green');
    expect(result?.material).toEqual('Cotton');
    expect(result?.quantity).toEqual(7);
    expect(result?.created_at).toBeInstanceOf(Date);
  });

  it('should handle edge case with ID 0', async () => {
    // Test with ID 0 (which shouldn't exist due to serial starting at 1)
    const input: GetBagInput = {
      id: 0
    };

    const result = await getBag(input);

    expect(result).toBeNull();
  });

  it('should verify database structure matches schema', async () => {
    // Create a bag and verify all expected fields are present
    const testBag = await db.insert(bagsTable)
      .values({
        type: 'Messenger',
        color: 'Black',
        material: 'Nylon',
        quantity: 2
      })
      .returning()
      .execute();

    const input: GetBagInput = {
      id: testBag[0].id
    };

    const result = await getBag(input);

    // Verify all schema fields are present and correctly typed
    expect(result).not.toBeNull();
    expect(typeof result?.id).toBe('number');
    expect(typeof result?.type).toBe('string');
    expect(typeof result?.color).toBe('string');
    expect(typeof result?.material).toBe('string');
    expect(typeof result?.quantity).toBe('number');
    expect(result?.created_at).toBeInstanceOf(Date);
    
    // Verify integer quantity
    expect(Number.isInteger(result?.quantity)).toBe(true);
  });
});