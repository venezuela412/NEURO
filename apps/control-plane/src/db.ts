import { mkdir } from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";

const DATA_DIR = process.env.NEURO_DB_PATH
  ? path.resolve(process.env.NEURO_DB_PATH)
  : path.resolve(process.cwd(), ".neuro-db");

type QueryResult<Row> = {
  rows: Row[];
  affectedRows?: number;
};

export interface DbClient {
  query<Row = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<QueryResult<Row>>;
  exec?(sql: string): Promise<void>;
  dialect: "pglite" | "postgres";
}

let dbPromise: Promise<DbClient> | null = null;

const schemaSql = `
  CREATE TABLE IF NOT EXISTS portfolio_state (
    wallet_address TEXT PRIMARY KEY,
    state_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS execution_receipts (
    id TEXT PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    receipt_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS used_signed_nonces (
    wallet_address TEXT NOT NULL,
    nonce TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (wallet_address, nonce)
  );

  CREATE TABLE IF NOT EXISTS wallet_action_sessions (
    session_id TEXT PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    issued_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );
`;

async function createPGliteDb(): Promise<DbClient> {
  await mkdir(DATA_DIR, { recursive: true });
  const db = await PGlite.create(DATA_DIR);
  await db.exec(schemaSql);

  return {
    dialect: "pglite",
    query: (sql, params) => db.query(sql, params),
    exec: async (sql) => {
      await db.exec(sql);
    },
  };
}

async function createPostgresDb(): Promise<DbClient> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === "require" ? { rejectUnauthorized: false } : undefined,
  });

  await pool.query(schemaSql);

  return {
    dialect: "postgres",
    query: async (sql, params) => {
      const result = await pool.query(sql, params);
      return {
        rows: result.rows,
        affectedRows: result.rowCount ?? undefined,
      };
    },
  };
}

async function createDb(): Promise<DbClient> {
  if (process.env.DATABASE_URL) {
    return createPostgresDb();
  }

  return createPGliteDb();
}

export function getDb() {
  dbPromise ??= createDb();
  return dbPromise;
}

export { DATA_DIR };
