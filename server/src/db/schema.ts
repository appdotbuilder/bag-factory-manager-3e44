import { serial, text, pgTable, timestamp, integer } from 'drizzle-orm/pg-core';

export const bagsTable = pgTable('bags', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(),
  color: text('color').notNull(),
  material: text('material').notNull(),
  quantity: integer('quantity').notNull(), // Use integer for whole numbers
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript type for the table schema
export type Bag = typeof bagsTable.$inferSelect; // For SELECT operations
export type NewBag = typeof bagsTable.$inferInsert; // For INSERT operations

// Important: Export all tables and relations for proper query building
export const tables = { bags: bagsTable };