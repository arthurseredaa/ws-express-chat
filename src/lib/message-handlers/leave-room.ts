import {type WebSocket} from "ws";
import {closeWithError} from "../close-with-error.ts";
import {CloseError} from "../../constants.ts";
import {sendServerMessage} from "../send-server-message.ts";
import type {RoomRegistry} from "../registry/room-registry.ts";
import type {ClientRegistry} from "../registry/client-registry.ts";

type LeaveRoomHandlerArgs = {
    ws: WebSocket;
    roomRegistry: RoomRegistry;
    clientRegistry: ClientRegistry;
    userId: number;
}

export const leaveRoomHandler = ({roomRegistry, clientRegistry, ws, userId}: LeaveRoomHandlerArgs) => {
    const leftRoom = roomRegistry.leaveRoom(userId);

    if (leftRoom === null) {
        return closeWithError(ws, CloseError.INVALID_MESSAGE);
    }

    sendServerMessage(ws, {
        type: 'lobby',
    })

    const members = roomRegistry.getMembers(leftRoom);

    return clientRegistry.broadcastMessage({
        message: {
            type: 'leave',
            userId
        },
        receivers: members
    })
}