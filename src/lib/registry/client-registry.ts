import {WebSocket} from 'ws';
import type {ServerMessage} from "../../types.ts";

type ClientState = {ws: WebSocket, isAlive: boolean};

type ClientArgs = {
    userId: number;
    ws: WebSocket;
}

export class ClientRegistry {
    #clients = new Map<number, ClientState>();

    registerClient({userId, ws}: ClientArgs): WebSocket | null {
        const currentSocket = this.#clients.get(userId);

        const clientState: ClientState = {ws, isAlive: true}
        this.#clients.set(userId, clientState);

        return currentSocket?.ws ?? null;
    }

    deleteClient({userId, ws}: ClientArgs): void {
        const currentSocket = this.#clients.get(userId);

        if (currentSocket?.ws !== ws) return;

        this.#clients.delete(userId);
    }

    broadcastMessage(data: ServerMessage, exceptId?: number): void {
        const messageData = JSON.stringify(data);

        for (const [key, value] of this.#clients) {
            if (exceptId === key) continue;

            if (value.ws.readyState !== WebSocket.OPEN) continue;

            value.ws.send(messageData);
        }
    }

    markAlive({userId}: {userId: number}): void {
        const client = this.#clients.get(userId);

        if (client) {
            client.isAlive = true;
        }
    }

    iterateClients(cb: (client: ClientState) => void): void {
        for (const clientState of this.#clients.values()) {
            cb(clientState);
        }
    }
}