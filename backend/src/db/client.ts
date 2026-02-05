import pg from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(text: string, params?: (string | number | boolean | null)[]): Promise<pg.QueryResult> {
  return pool.query(text, params);
}

export async function getClient(): Promise<pg.PoolClient> {
  return pool.connect();
}

export { pool };
