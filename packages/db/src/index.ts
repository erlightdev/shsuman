import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql, { type Pool } from "mysql2";

import type { DatabaseConfig } from "./config";
import { relations } from "./relations";

export type Database = MySql2Database<typeof relations> & {
  $client: Pool;
};

export function createDb(env: DatabaseConfig): Database {
  const client = mysql.createPool(env.DATABASE_URL);
  return drizzle({
    client,
    relations,
  });
}
