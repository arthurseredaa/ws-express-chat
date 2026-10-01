import {HEARTBEAT_INTERVAL} from "../constants.ts";
import type {ClientRegistry} from "./registry/client-registry.ts";

export const startHeartbeat = (registry: ClientRegistry) => {
    return setInterval(() => {
        registry.iterateClients((clientState) => {
            if (!clientState.isAlive) {
                clientState.ws.terminate();
            } else {
                clientState.isAlive = false;
                clientState.ws.ping();
            }
        })
    }, HEARTBEAT_INTERVAL)
}