import {WebSocket} from "ws";
import type {ClientRegistry} from "../client-registry.ts";
import {validateClientMessage} from "./validate-client-message.ts";

export const handleConnection = (ws: WebSocket, registry: ClientRegistry)=> {
    const clientId = registry.registerClient(ws);

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
        let parsedData: string | null = null

        try {
            parsedData = JSON.parse(data.toString());
        } catch (error) {
            console.error(`Unable to parse message data: ${clientId}`);
            ws.close(1008, 'Policy violation')
        }

        const messageData = validateClientMessage(parsedData);

        if (!messageData) {
            ws.close(1008, 'Policy violation')
            return;
        }

        registry.broadcastMessage({
            clientId,
            text: messageData.text,
            type: 'chat',
        }, clientId)
    })
}