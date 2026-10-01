import {DatabaseSync} from 'node:sqlite';
import * as path from "node:path";

// DB_PATH lets tests use a throwaway database file
export const db = new DatabaseSync(process.env.DB_PATH ?? path.join(import.meta.dirname, 'db.sqlite'));

// SQLite ignores REFERENCES unless foreign keys are switched on per connection
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
    CREATE TABLE IF NOT EXISTS users
    (
        id       INTEGER PRIMARY KEY AUTOINCREMENT,
        email    TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS rooms
    (
        name       TEXT PRIMARY KEY,
        created_by INTEGER NOT NULL REFERENCES users (id),
        created_at INTEGER NOT NULL
    )
`);

// user_id is the primary key: a user can be in at most one room, enforced by the database itself
db.exec(`
    CREATE TABLE IF NOT EXISTS room_members
    (
        user_id   INTEGER PRIMARY KEY REFERENCES users (id),
        room      TEXT    NOT NULL REFERENCES rooms (name) ON DELETE CASCADE,
        joined_at INTEGER NOT NULL
    )
`);

db.exec('CREATE INDEX IF NOT EXISTS room_members_room ON room_members (room)');
