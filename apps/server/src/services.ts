import { createAuth } from "@shsuman/auth";
import { createDb } from "@shsuman/db";

import { ENV } from "./env.server";

export const db = createDb(ENV);
export const auth = createAuth(ENV, db);
