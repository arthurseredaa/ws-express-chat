import type {WebSocket} from "ws";
import type {ClientRegistry} from "./registry/client-registry.ts";
import {validateClientMessage} from "./validate-client-message/validate-client-message.ts";
import {CloseError, type CloseErrorType, MESSAGE_COUNT_LIMIT, RATE_LIMIT_WINDOW} from "../constants.ts";
import {parseClientMessage} from "./parse-client-message.ts";
import {MessageRateLimiter} from "./message-rate-limiter.ts";
import type {IncomingMessage} from "node:http";
import {getUserIdFromRequest} from "./get-user-id-from-request.ts";

export const handleConnection = (ws: WebSocket, request: IncomingMessage, registry: ClientRegistry)=> {
    const userId = getUserIdFromRequest(request);

    if (userId === null) {
        return closeWithError(ws, CloseError.UNAUTHORIZED);
    }

    const oldSocket = registry.registerClient({ws, userId});

    if (oldSocket) {
        closeWithError(oldSocket, CloseError.SESSION_REPLACED)
        oldSocket.close(CloseError.SESSION_REPLACED.code, CloseError.SESSION_REPLACED.reason);
    }

    const messageRateLimiter = new MessageRateLimiter(MESSAGE_COUNT_LIMIT, RATE_LIMIT_WINDOW);

    console.log(`[c_id: ${userId}, u_id: ${userId}] connected`);

    // registry.broadcastMessage({
    //     type: 'join',
    //     userId,
    // }, userId);

    ws.on('pong', () => {
        registry.markAlive({ userId });
    })

    ws.on('error', console.error);

    ws.on('close', () => {
        console.log(`Client ID: ${userId} disconnected`);
        // registry.broadcastMessage({userId, type: 'leave'}, userId);
        registry.deleteClient({ws, userId});
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
            case 'chat':
                return registry.broadcastMessage({
                    userId,
                    text: messageData.text,
                    type: 'chat',
                }, userId)
            case 'create_room':
            case "join_room":
            case "leave_room":
                break;
            default:
                break;
        }


    })
}

const closeWithError = (ws: WebSocket, error: CloseErrorType)=> {
    ws.close(error.code, error.reason);
}