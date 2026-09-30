import type {WebSocket} from "ws";
import type {ClientRegistry} from "../client-registry.ts";
import {validateClientMessage} from "./validate-client-message.ts";
import {CloseError, type CloseErrorType, MESSAGE_COUNT_LIMIT, RATE_LIMIT_WINDOW} from "../constants.ts";
import {parseClientMessage} from "./parse-client-message.ts";
import {MessageRateLimiter} from "./message-rate-limiter.ts";

export const handleConnection = (ws: WebSocket, registry: ClientRegistry)=> {
    const clientId = registry.registerClient(ws);
    const messageRateLimiter = new MessageRateLimiter(MESSAGE_COUNT_LIMIT, RATE_LIMIT_WINDOW);

    console.log(`Client ID: ${clientId} connected`);

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
            closeWithError(ws, CloseError.RATE_LIMIT_EXCEEDED);
            return;
        }

        const parsedData = parseClientMessage(data)
        const messageData = validateClientMessage(parsedData);

        if (!messageData) {
            closeWithError(ws, CloseError.INVALID_MESSAGE);
            return;
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