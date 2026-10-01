import type {WebSocket} from "ws";
import {CloseError} from "../../constants.ts";
import type {RoomRegistry} from "../registry/room-registry.ts";
import type {ClientRegistry} from "../registry/client-registry.ts";
import {closeWithError} from "../close-with-error.ts";
import type {ChatMessage} from "../../types.ts";

type ChatHandlerArgs = {
    roomRegistry: RoomRegistry;
    clientRegistry: ClientRegistry;
    userId: number;
    message: ChatMessage;
    ws: WebSocket
}

export const chatHandler = ({roomRegistry, clientRegistry, userId, message, ws}: ChatHandlerArgs) => {
    const userRoom = roomRegistry.getUserRoom(userId);

    if (!userRoom) {
        return closeWithError(ws, CloseError.INVALID_MESSAGE);
    }

    const members = roomRegistry.getMembers(userRoom);

    return clientRegistry.broadcastMessage({
        message: {
            userId,
            text: message.text,
            type: 'chat',
        },
        receivers: members,
        exceptId: userId
    })
}