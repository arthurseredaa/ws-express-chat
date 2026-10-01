import {validateRoomName} from "./validate-room-name.ts";
import type {CreateRoomMessage} from "../../types.ts";

export const validateCreateRoom = (data: object): CreateRoomMessage | null => {
    const roomName = validateRoomName(data);

    if (!roomName) return null;

    return {
        type: 'create_room',
        room: roomName,
    }
}