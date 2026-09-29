import type { Session } from "@shsuman/auth";
import type { Database } from "@shsuman/db";

export type Context = {
  session: Session | null;
  db: Database;
};
