import { Pool } from 'pg';
import { DATABASE_URL } from '$env/static/private';

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

export async function transaction<T>(
  callback: (query: typeof transactionQuery) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const transactionQuery = async <R>(text: string, params?: unknown[]): Promise<R[]> => {
      const result = await client.query(text, params);
      return result.rows as R[];
    };
    const result = await callback(transactionQuery);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}