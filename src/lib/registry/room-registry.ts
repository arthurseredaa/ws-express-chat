export class RoomRegistry {
    #members = new Map<string, Set<number>>();
    #roomOf = new Map<number, string>();

    createRoom(room: string, userId: number): 'room_exists' | 'ok' {
        const isRoomExist = this.#members.has(room);

        if (isRoomExist) {
            return 'room_exists'
        }

        this.#members.set(room, new Set([userId]));
        this.#roomOf.set(userId, room);

        return 'ok'
    }
    joinRoom(room: string, userId: number): 'room_not_found' | 'ok' {
        const members = this.#members.get(room);
        if (!members) {
            return 'room_not_found'
        }

        members.add(userId);
        this.#roomOf.set(userId, room);

        return 'ok'
    }
    leaveRoom(userId: number): string | null{
        const room = this.#roomOf.get(userId);
        if (!room) {
            return null
        }

        this.#roomOf.delete(userId);

        const members = this.#members.get(room)
        if (!members) {
            return null
        }

        members.delete(userId);

        const isRoomEmpty = members.size === 0
        if (isRoomEmpty) {
            this.#members.delete(room);
        }

        return room;
    }
    getMembers(room: string): number[] | [] {
        return [...(this.#members.get(room) || [])];
    }
    getUserRoom(userId: number){
        return this.#roomOf.get(userId) ?? null;
    }
}