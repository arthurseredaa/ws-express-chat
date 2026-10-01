import type {WebSocket} from "ws";
import type {ClientRegistry} from "./registry/client-registry.ts";
import {validateClientMessage} from "./validate-client-message/validate-client-message.ts";
import {CloseError, MESSAGE_COUNT_LIMIT, RATE_LIMIT_WINDOW} from "../constants.ts";
import {parseClientMessage} from "./parse-client-message.ts";
import {MessageRateLimiter} from "./message-rate-limiter.ts";
import type {IncomingMessage} from "node:http";
import {getUserIdFromRequest} from "./get-user-id-from-request.ts";
import type {RoomRegistry} from "./registry/room-registry.ts";
import {closeWithError} from "./close-with-error.ts";
import {chatHandler} from "./message-handlers/chat.ts";
import {sendServerMessage} from "./send-server-message.ts";
import {createRoomHandler} from "./message-handlers/create-room.ts";
import {joinRoomHandler} from "./message-handlers/join-room.ts";
import {leaveRoomHandler} from "./message-handlers/leave-room.ts";

type HandleConnectionArgs = {
    ws: WebSocket;
    request: IncomingMessage;
    clientRegistry: ClientRegistry;
    roomRegistry: RoomRegistry;
}

export const handleConnection = ({
    ws,
    request,
    clientRegistry,
    roomRegistry
}: HandleConnectionArgs) => {
    const userId = getUserIdFromRequest(request);

    if (userId === null) {
        return closeWithError(ws, CloseError.UNAUTHORIZED);
    }

    const oldSocket = clientRegistry.registerClient({ws, userId});

    if (oldSocket) {
        closeWithError(oldSocket, CloseError.SESSION_REPLACED)
    }

    const userRoom = roomRegistry.getUserRoom(userId);

    if (userRoom === null) {
        sendServerMessage(ws, {type: 'lobby'});
    } else {
        const members = roomRegistry.getMembers(userRoom);
        sendServerMessage(ws, {type: 'room_joined', room: userRoom, members})
    }

    const messageRateLimiter = new MessageRateLimiter(MESSAGE_COUNT_LIMIT, RATE_LIMIT_WINDOW);

    console.log(`[c_id: ${userId}, u_id: ${userId}] connected`);

    ws.on('pong', () => {
        clientRegistry.markAlive({userId});
    })

    ws.on('error', console.error);

    ws.on('close', () => {
        console.log(`Client ID: ${userId} disconnected`);
        clientRegistry.deleteClient({ws, userId});
    });

    ws.on('message', (data) => {
        const isMessageAllowed = messageRateLimiter.isAllowed();

        if (!isMessageAllowed) {
            return closeWithError(ws, CloseError.RATE_LIMIT_EXCEEDED);
        }

        const parsedData = parseClientMessage(data)
        const messageData = validateClientMessage(parsedData);

        if (!messageData) {
            return closeWithError(ws, CloseError.INVALID_MESSAGE);
        }

        switch (messageData.type) {
            case 'chat': {
                return chatHandler({
                    ws,
                    roomRegistry,
                    clientRegistry,
                    userId,
                    message: messageData,
                })
            }
            case 'create_room': {
                return createRoomHandler({
                    ws,
                    roomRegistry,
                    message: messageData,
                    userId
                })
            }
            case "join_room":
                return joinRoomHandler({
                    ws,
                    roomRegistry,
                    clientRegistry,
                    message: messageData,
                    userId
                })
            case "leave_room":
                return leaveRoomHandler({
                    ws,
                    userId,
                    clientRegistry,
                    roomRegistry,
                })
            default:
                break;
        }


    })
}

