import { Pool, QueryResult, QueryResultRow } from 'pg';

declare global {
  var __pgPool: Pool | undefined;
}

let pool: Pool;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://rytc:1234@localhost:5432/rytc',
  });
} else {
  if (!global.__pgPool) {
    global.__pgPool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://rytc:1234@localhost:5432/rytc',
    });
  }
  pool = global.__pgPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

export default pool;
