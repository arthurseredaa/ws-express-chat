import type {ClientMessage} from "../../types.ts";
import {validateChat} from "./validate-chat.ts";
import {validateJoinRoom} from "./validate-join-room.ts";
import {validateCreateRoom} from "./validate-create-room.ts";

export const validateClientMessage = (data: unknown): ClientMessage | null => {
    if (typeof data !== 'object' || !data) return null;

    if (!('type' in data )) return null;

    if (typeof data.type !== 'string') return null;

    switch (data.type) {
        case 'chat':
            return validateChat(data);
        case 'join_room':
            return validateJoinRoom(data);
        case 'create_room':
            return validateCreateRoom(data);
        case 'leave_room':
            return {type: 'leave_room'};
        default:
            return null;
    }
}
