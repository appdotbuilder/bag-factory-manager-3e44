import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { bagsTable } from '../db/schema';
import { getBags } from '../handlers/get_bags';

describe('getBags', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no bags exist', async () => {
    const result = await getBags();

    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return all bags from database', async () => {
    // Create test bags
    const testBags = [
      {
        type: 'backpack',
        color: 'blue',
        material: 'nylon',
        quantity: 5
      },
      {
        type: 'tote',
        color: 'red',
        material: 'canvas',
        quantity: 3
      },
      {
        type: 'messenger',
        color: 'black',
        material: 'leather',
        quantity: 10
      }
    ];

    // Insert test bags
    await db.insert(bagsTable)
      .values(testBags)
      .execute();

    const result = await getBags();

    expect(result).toHaveLength(3);
    
    // Verify all bags are returned
    const types = result.map(bag => bag.type);
    expect(types).toContain('backpack');
    expect(types).toContain('tote');
    expect(types).toContain('messenger');

    // Verify structure of returned bags
    result.forEach(bag => {
      expect(bag.id).toBeDefined();
      expect(typeof bag.id).toBe('number');
      expect(typeof bag.type).toBe('string');
      expect(typeof bag.color).toBe('string');
      expect(typeof bag.material).toBe('string');
      expect(typeof bag.quantity).toBe('number');
      expect(bag.created_at).toBeInstanceOf(Date);
    });
  });

  it('should return bags with correct data values', async () => {
    const testBag = {
      type: 'duffel',
      color: 'green',
      material: 'polyester',
      quantity: 7
    };

    // Insert single test bag
    await db.insert(bagsTable)
      .values([testBag])
      .execute();

    const result = await getBags();

    expect(result).toHaveLength(1);
    
    const bag = result[0];
    expect(bag.type).toEqual('duffel');
    expect(bag.color).toEqual('green');
    expect(bag.material).toEqual('polyester');
    expect(bag.quantity).toEqual(7);
    expect(bag.id).toBeGreaterThan(0);
    expect(bag.created_at).toBeInstanceOf(Date);
  });

  it('should return bags in database order', async () => {
    // Insert bags in specific order
    const firstBag = {
      type: 'first_bag',
      color: 'white',
      material: 'cotton',
      quantity: 1
    };
    
    const secondBag = {
      type: 'second_bag',
      color: 'yellow',
      material: 'vinyl',
      quantity: 2
    };

    // Insert first bag
    await db.insert(bagsTable)
      .values([firstBag])
      .execute();

    // Insert second bag
    await db.insert(bagsTable)
      .values([secondBag])
      .execute();

    const result = await getBags();

    expect(result).toHaveLength(2);
    expect(result[0].type).toEqual('first_bag');
    expect(result[1].type).toEqual('second_bag');
    expect(result[0].id).toBeLessThan(result[1].id);
  });

  it('should handle bags with zero quantity', async () => {
    const testBag = {
      type: 'empty_bag',
      color: 'transparent',
      material: 'plastic',
      quantity: 0
    };

    await db.insert(bagsTable)
      .values([testBag])
      .execute();

    const result = await getBags();

    expect(result).toHaveLength(1);
    expect(result[0].quantity).toEqual(0);
    expect(result[0].type).toEqual('empty_bag');
  });
});