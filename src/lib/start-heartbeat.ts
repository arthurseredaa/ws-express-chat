import {HEARTBEAT_INTERVAL} from "../constants.ts";
import type {ClientRegistry} from "../client-registry.ts";

export const startHeartbeat = (registry: ClientRegistry) => {
    const interval = setInterval(() => {
        registry.iterateClients((clientState) => {
            if (!clientState.isAlive) {
                clientState.ws.terminate();
            } else {
                clientState.isAlive = false;
                clientState.ws.ping();
            }
        })
    }, HEARTBEAT_INTERVAL)

    return interval;
}