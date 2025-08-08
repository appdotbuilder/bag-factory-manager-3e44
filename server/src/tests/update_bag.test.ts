import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { bagsTable } from '../db/schema';
import { type UpdateBagInput, type CreateBagInput } from '../schema';
import { updateBag } from '../handlers/update_bag';
import { eq } from 'drizzle-orm';

// Helper function to create a test bag
const createTestBag = async (bagData: CreateBagInput) => {
  const result = await db.insert(bagsTable)
    .values({
      type: bagData.type,
      color: bagData.color,
      material: bagData.material,
      quantity: bagData.quantity
    })
    .returning()
    .execute();
  
  return result[0];
};

// Test input data
const testBagData: CreateBagInput = {
  type: 'backpack',
  color: 'blue',
  material: 'nylon',
  quantity: 5
};

describe('updateBag', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update all fields of an existing bag', async () => {
    // Create test bag
    const createdBag = await createTestBag(testBagData);

    // Update all fields
    const updateInput: UpdateBagInput = {
      id: createdBag.id,
      type: 'messenger',
      color: 'red',
      material: 'leather',
      quantity: 10
    };

    const result = await updateBag(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdBag.id);
    expect(result!.type).toEqual('messenger');
    expect(result!.color).toEqual('red');
    expect(result!.material).toEqual('leather');
    expect(result!.quantity).toEqual(10);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.created_at).toEqual(createdBag.created_at);
  });

  it('should update only specific fields', async () => {
    // Create test bag
    const createdBag = await createTestBag(testBagData);

    // Update only type and quantity
    const updateInput: UpdateBagInput = {
      id: createdBag.id,
      type: 'tote',
      quantity: 15
    };

    const result = await updateBag(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdBag.id);
    expect(result!.type).toEqual('tote'); // Updated
    expect(result!.color).toEqual('blue'); // Unchanged
    expect(result!.material).toEqual('nylon'); // Unchanged
    expect(result!.quantity).toEqual(15); // Updated
    expect(result!.created_at).toEqual(createdBag.created_at);
  });

  it('should update quantity to zero', async () => {
    // Create test bag
    const createdBag = await createTestBag(testBagData);

    // Update quantity to zero
    const updateInput: UpdateBagInput = {
      id: createdBag.id,
      quantity: 0
    };

    const result = await updateBag(updateInput);

    expect(result).not.toBeNull();
    expect(result!.quantity).toEqual(0);
  });

  it('should save updated bag to database', async () => {
    // Create test bag
    const createdBag = await createTestBag(testBagData);

    // Update bag
    const updateInput: UpdateBagInput = {
      id: createdBag.id,
      color: 'green',
      material: 'canvas'
    };

    await updateBag(updateInput);

    // Verify changes in database
    const bags = await db.select()
      .from(bagsTable)
      .where(eq(bagsTable.id, createdBag.id))
      .execute();

    expect(bags).toHaveLength(1);
    expect(bags[0].color).toEqual('green');
    expect(bags[0].material).toEqual('canvas');
    expect(bags[0].type).toEqual('backpack'); // Unchanged
    expect(bags[0].quantity).toEqual(5); // Unchanged
  });

  it('should return null for non-existent bag', async () => {
    const updateInput: UpdateBagInput = {
      id: 999, // Non-existent ID
      type: 'messenger'
    };

    const result = await updateBag(updateInput);

    expect(result).toBeNull();
  });

  it('should return existing bag when no fields are provided for update', async () => {
    // Create test bag
    const createdBag = await createTestBag(testBagData);

    // Update with no optional fields
    const updateInput: UpdateBagInput = {
      id: createdBag.id
    };

    const result = await updateBag(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdBag.id);
    expect(result!.type).toEqual('backpack');
    expect(result!.color).toEqual('blue');
    expect(result!.material).toEqual('nylon');
    expect(result!.quantity).toEqual(5);
    expect(result!.created_at).toEqual(createdBag.created_at);
  });

  it('should handle updating each field individually', async () => {
    // Create test bag
    const createdBag = await createTestBag(testBagData);

    // Test updating type only
    let result = await updateBag({
      id: createdBag.id,
      type: 'duffle'
    });
    expect(result!.type).toEqual('duffle');
    expect(result!.color).toEqual('blue'); // Unchanged

    // Test updating color only
    result = await updateBag({
      id: createdBag.id,
      color: 'black'
    });
    expect(result!.color).toEqual('black');
    expect(result!.type).toEqual('duffle'); // From previous update

    // Test updating material only
    result = await updateBag({
      id: createdBag.id,
      material: 'cotton'
    });
    expect(result!.material).toEqual('cotton');
    expect(result!.color).toEqual('black'); // From previous update

    // Test updating quantity only
    result = await updateBag({
      id: createdBag.id,
      quantity: 25
    });
    expect(result!.quantity).toEqual(25);
    expect(result!.material).toEqual('cotton'); // From previous update
  });
});