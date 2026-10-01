import type {WebSocket} from "ws";
import type {RoomRegistry} from "../registry/room-registry.ts";
import type {JoinRoomMessage} from "../../types.ts";
import {closeWithError} from "../close-with-error.ts";
import {CloseError} from "../../constants.ts";
import {sendServerMessage} from "../send-server-message.ts";
import type {ClientRegistry} from "../registry/client-registry.ts";

type JoinRoomHandlerArgs = {
    ws: WebSocket;
    roomRegistry: RoomRegistry;
    clientRegistry: ClientRegistry;
    message: JoinRoomMessage;
    userId: number;
}

export const joinRoomHandler = ({ws, roomRegistry, clientRegistry, message, userId}: JoinRoomHandlerArgs) => {
    const userRoom = roomRegistry.getUserRoom(userId);

    if (userRoom) {
        return closeWithError(ws, CloseError.INVALID_MESSAGE);
    }

    const result = roomRegistry.joinRoom(message.room, userId);

    if (result === 'room_not_found') {
        return sendServerMessage(ws, {type: 'error', code: 'room_not_found'});
    }

    if (result === 'ok') {
        const members = roomRegistry.getMembers(message.room)

        sendServerMessage(ws, {type: 'room_joined', room: message.room, members})

        return clientRegistry.broadcastMessage({
            message: {
                type: 'join',
                userId,
            },
            receivers: members,
            exceptId: userId,
        })
    }
}