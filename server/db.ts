import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";

export const sqlite = new Database('eduhub.db');
export const db = drizzle(sqlite, { schema });