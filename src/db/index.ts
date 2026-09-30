import {DatabaseSync} from 'node:sqlite';
import * as path from "node:path";

export const db = new DatabaseSync(path.join(import.meta.dirname, 'db.sqlite'));

db.exec(`
    CREATE TABLE IF NOT EXISTS users
    (
        id       INTEGER PRIMARY KEY AUTOINCREMENT,
        email    TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )
`);
