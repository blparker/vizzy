import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core';

export const vizzes = pgTable(
    'vizzes',
    {
        id: text('id').primaryKey(),
        ownerId: text('owner_id').notNull(),
        title: text('title').notNull().default('Untitled'),
        codeTs: text('code_ts').notNull(),
        codeJs: text('code_js').notNull(),
        theme: text('theme', { enum: ['light', 'dark'] }).notNull().default('dark'),
        forkedFrom: text('forked_from'),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (t) => [index('vizzes_owner_idx').on(t.ownerId), index('vizzes_created_idx').on(t.createdAt)]
);

export type Viz = typeof vizzes.$inferSelect;
export type NewViz = typeof vizzes.$inferInsert;
