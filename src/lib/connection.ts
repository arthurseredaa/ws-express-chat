import type {WebSocket} from "ws";
import type {ClientRegistry} from "../client-registry.ts";
import {validateClientMessage} from "./validate-client-message.ts";
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

    const clientId = registry.registerClient(ws);
    const messageRateLimiter = new MessageRateLimiter(MESSAGE_COUNT_LIMIT, RATE_LIMIT_WINDOW);

    console.log(`[c_id: ${clientId}, u_id: ${userId}] connected`);

    registry.broadcastMessage({
        type: 'join',
        clientId,
    }, clientId);

    ws.on('pong', () => {
        registry.markAlive(clientId);
    })

    ws.on('error', console.error);

    ws.on('close', () => {
        console.log(`Client ID: ${clientId} disconnected`);
        registry.broadcastMessage({clientId, type: 'leave'}, clientId);
        registry.deleteClient(clientId);
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

        registry.broadcastMessage({
            clientId,
            text: messageData.text,
            type: 'chat',
        }, clientId)
    })
}

const closeWithError = (ws: WebSocket, error: CloseErrorType)=> {
    ws.close(error.code, error.reason);
}