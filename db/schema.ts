import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const runs=sqliteTable('runs',{id:text('id').primaryKey(),data:text('data').notNull(),updatedAt:text('updated_at').notNull(),revision:integer('revision').notNull().default(0)},t=>[index('idx_runs_updated_at').on(t.updatedAt)]);
