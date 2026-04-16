import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

type DB = ReturnType<typeof createDb>;

function createDb() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        throw new Error('DATABASE_URL is not set');
    }
    const sql = neon(url);
    return drizzle({ client: sql, schema });
}

let _db: DB | undefined;

export const db = new Proxy({} as DB, {
    get(_target, prop, receiver) {
        if (!_db) _db = createDb();
        return Reflect.get(_db, prop, receiver);
    },
});

export { schema };
