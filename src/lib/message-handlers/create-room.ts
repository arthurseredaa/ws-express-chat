import {type WebSocket} from "ws";
import {closeWithError} from "../close-with-error.ts";
import {CloseError} from "../../constants.ts";
import type {RoomRegistry} from "../registry/room-registry.ts";
import type {CreateRoomMessage} from "../../types.ts";
import {sendServerMessage} from "../send-server-message.ts";

type CreateRoomHandlerArgs = {
    ws: WebSocket;
    roomRegistry: RoomRegistry;
    message: CreateRoomMessage;
    userId: number;
}

export const createRoomHandler = ({ws, roomRegistry, message, userId}: CreateRoomHandlerArgs) => {
    const userRoom = roomRegistry.getUserRoom(userId);

    if (userRoom) {
        return closeWithError(ws, CloseError.INVALID_MESSAGE);
    }

    const result = roomRegistry.createRoom(message.room, userId);

    if (result === 'room_exists') {
        return sendServerMessage(ws, {type: 'error', code: 'room_exists'})
    }

    if (result === 'ok') {
        const members = roomRegistry.getMembers(message.room)
        return sendServerMessage(ws, {type: 'room_joined', room: message.room, members})
    }
}