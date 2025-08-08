import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { bagsTable } from '../db/schema';
import { type CreateBagInput } from '../schema';
import { createBag } from '../handlers/create_bag';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateBagInput = {
  type: 'Backpack',
  color: 'Blue',
  material: 'Canvas',
  quantity: 5
};

describe('createBag', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a bag', async () => {
    const result = await createBag(testInput);

    // Basic field validation
    expect(result.type).toEqual('Backpack');
    expect(result.color).toEqual('Blue');
    expect(result.material).toEqual('Canvas');
    expect(result.quantity).toEqual(5);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save bag to database', async () => {
    const result = await createBag(testInput);

    // Query using proper drizzle syntax
    const bags = await db.select()
      .from(bagsTable)
      .where(eq(bagsTable.id, result.id))
      .execute();

    expect(bags).toHaveLength(1);
    expect(bags[0].type).toEqual('Backpack');
    expect(bags[0].color).toEqual('Blue');
    expect(bags[0].material).toEqual('Canvas');
    expect(bags[0].quantity).toEqual(5);
    expect(bags[0].created_at).toBeInstanceOf(Date);
  });

  it('should create multiple bags with different properties', async () => {
    const input1: CreateBagInput = {
      type: 'Handbag',
      color: 'Red',
      material: 'Leather',
      quantity: 3
    };

    const input2: CreateBagInput = {
      type: 'Tote',
      color: 'Black',
      material: 'Cotton',
      quantity: 10
    };

    const result1 = await createBag(input1);
    const result2 = await createBag(input2);

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.type).toEqual('Handbag');
    expect(result1.color).toEqual('Red');
    expect(result2.type).toEqual('Tote');
    expect(result2.color).toEqual('Black');

    // Verify both are in database
    const allBags = await db.select()
      .from(bagsTable)
      .execute();

    expect(allBags).toHaveLength(2);
  });

  it('should handle zero quantity bags', async () => {
    const zeroQuantityInput: CreateBagInput = {
      type: 'Sample Bag',
      color: 'White',
      material: 'Plastic',
      quantity: 0
    };

    const result = await createBag(zeroQuantityInput);

    expect(result.quantity).toEqual(0);
    expect(result.type).toEqual('Sample Bag');
  });

  it('should create bags with large quantities', async () => {
    const largeQuantityInput: CreateBagInput = {
      type: 'Wholesale Bag',
      color: 'Green',
      material: 'Nylon',
      quantity: 1000
    };

    const result = await createBag(largeQuantityInput);

    expect(result.quantity).toEqual(1000);
    expect(result.type).toEqual('Wholesale Bag');
  });
});