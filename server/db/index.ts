import { Database as BunDatabase } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

const sqlite = new BunDatabase("rosalia.db");
export const db = drizzle(sqlite, { schema });

export type DB = typeof db;
