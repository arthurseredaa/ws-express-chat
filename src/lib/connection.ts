import {WebSocket} from "ws";
import type {ClientRegistry} from "../client-registry.ts";

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
        registry.broadcastMessage({
            text: data.toString(),
            clientId,
            type: 'chat'
        }, clientId)
    })
}