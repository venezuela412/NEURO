import { mkdir } from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";

const DATA_DIR = process.env.NEURO_DB_PATH
  ? path.resolve(process.env.NEURO_DB_PATH)
  : path.resolve(process.cwd(), ".neuro-db");

let dbPromise: Promise<PGlite> | null = null;

async function createDb() {
  await mkdir(DATA_DIR, { recursive: true });
  const db = await PGlite.create(DATA_DIR);

  await db.exec(`
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
  `);

  return db;
}

export function getDb() {
  dbPromise ??= createDb();
  return dbPromise;
}

export { DATA_DIR };
