import {MAX_ROOM_NAME_LENGTH} from "../../constants.ts";

export const validateRoomName = (data: object): string | null => {
    if (!('room' in data) || typeof data.room !== 'string') return null;

    const roomTrimmed = data.room.trim();

    if (!roomTrimmed || roomTrimmed.length > MAX_ROOM_NAME_LENGTH) return null;

    return roomTrimmed;
}
