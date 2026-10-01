import {WebSocket} from 'ws';
import type {ServerMessage} from "../../types.ts";

type ClientState = {ws: WebSocket, isAlive: boolean};

type ClientArgs = {
    userId: number;
    ws: WebSocket;
}

type BroadcastMessageArgs = {
    message: ServerMessage;
    receivers: number[] | [];
    exceptId?: number;
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

    broadcastMessage({message, receivers, exceptId}: BroadcastMessageArgs): void {
        const messageData = JSON.stringify(message);

        receivers.forEach(receiver => {
            if (receiver === exceptId) return;

            const clientData = this.#clients.get(receiver);

            if (!clientData) return;
            if (clientData.ws.readyState !== WebSocket.OPEN) return;

            clientData.ws.send(messageData);
        })
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