import type {JoinRoomMessage} from "../../types.ts";
import {MAX_ROOM_NAME_LENGTH} from "../../constants.ts";

export const validateJoinRoom = (data: object): JoinRoomMessage | null => {
    if (!('room' in data)) return null;
    if (typeof data.room !== 'string') return null;

    const roomTrimmed = data.room.trim();

    if (!roomTrimmed || roomTrimmed.length > MAX_ROOM_NAME_LENGTH) return null;

    return {
        type: 'join_room',
        room: roomTrimmed,
    }
}