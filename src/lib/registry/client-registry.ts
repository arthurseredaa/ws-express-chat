import {WebSocket} from 'ws';
import type {ServerMessage} from "../../types.ts";

type ClientState = {ws: WebSocket, isAlive: boolean};

export class ClientRegistry {
    #clients = new Map<number, ClientState>();
    #counter = 0;

    registerClient(ws: WebSocket): number {
        const clientId = ++this.#counter;

        const clientState: ClientState = {ws, isAlive: true}
        this.#clients.set(clientId, clientState);

        return clientId;
    }

    broadcastMessage(data: ServerMessage, exceptId?: number): void {
        const messageData = JSON.stringify(data);

        for (const [key, value] of this.#clients) {
            if (exceptId === key) continue;

            if (value.ws.readyState !== WebSocket.OPEN) continue;

            value.ws.send(messageData);
        }
    }

    markAlive(id: number): void {
        const client = this.#clients.get(id);

        if (client) {
            client.isAlive = true;
        }
    }

    deleteClient(id: number): void {
        this.#clients.delete(id);
    }

    iterateClients(cb: (client: ClientState) => void): void {
        for (const clientState of this.#clients.values()) {
            cb(clientState);
        }
    }
}