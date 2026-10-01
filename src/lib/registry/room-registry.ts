import {db} from "../../db/index.ts";
import {withTransaction} from "../../db/with-transaction.ts";

// Who is in which room. Pure data: no sockets, no messages — connection.ts decides who to notify.
// Backed by SQLite (tables `rooms` and `room_members`), so rooms survive server restarts.
// The database keeps the invariants: one room per user (user_id is the primary key of room_members),
// and an empty room is deleted in leaveRoom.
export class RoomRegistry {
    #roomExists = db.prepare('SELECT 1 FROM rooms WHERE name = ?');
    #insertRoom = db.prepare('INSERT INTO rooms (name, created_by, created_at) VALUES (?, ?, ?)');
    #deleteRoom = db.prepare('DELETE FROM rooms WHERE name = ?');
    #insertMember = db.prepare('INSERT INTO room_members (user_id, room, joined_at) VALUES (?, ?, ?)');
    #deleteMember = db.prepare('DELETE FROM room_members WHERE user_id = ?');
    #selectUserRoom = db.prepare('SELECT room FROM room_members WHERE user_id = ?');
    #selectMembers = db.prepare('SELECT user_id FROM room_members WHERE room = ? ORDER BY joined_at, rowid');
    #countMembers = db.prepare('SELECT COUNT(*) AS count FROM room_members WHERE room = ?');

    createRoom(room: string, userId: number): 'room_exists' | 'ok' {
        return withTransaction(() => {
            if (this.#roomExists.get(room)) {
                return 'room_exists';
            }

            const now = Date.now();
            this.#insertRoom.run(room, userId, now);
            this.#insertMember.run(userId, room, now);

            return 'ok';
        });
    }

    joinRoom(room: string, userId: number): 'room_not_found' | 'ok' {
        if (!this.#roomExists.get(room)) {
            return 'room_not_found';
        }

        this.#insertMember.run(userId, room, Date.now());

        return 'ok';
    }

    leaveRoom(userId: number): string | null {
        return withTransaction(() => {
            const room = this.getUserRoom(userId);
            if (room === null) {
                return null;
            }

            this.#deleteMember.run(userId);

            const row = this.#countMembers.get(room);
            if (Number(row?.count) === 0) {
                this.#deleteRoom.run(room);
            }

            return room;
        });
    }

    getMembers(room: string): number[] {
        return this.#selectMembers.all(room).map((row) => Number(row.user_id));
    }

    getUserRoom(userId: number): string | null {
        const room = this.#selectUserRoom.get(userId)?.room;
        return typeof room === 'string' ? room : null;
    }
}
