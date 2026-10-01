import {type IncomingMessage, type Server, type ServerResponse} from "node:http";
import {CloseError} from "../constants.ts";
import type {ClientRegistry} from "./registry/client-registry.ts";

type GracefulShutdownArgs = {
    server: Server<typeof IncomingMessage, typeof ServerResponse>
    heartbeatIntervalId: NodeJS.Timeout;
    clientRegistry: ClientRegistry;
}

export const gracefulShutdown = ({server, heartbeatIntervalId, clientRegistry}: GracefulShutdownArgs) => {
    server.close();
    clearInterval(heartbeatIntervalId);
    clientRegistry.iterateClients((clientState) => {
        clientState.ws.close(CloseError.SERVER_SHUTDOWN.code, CloseError.SERVER_SHUTDOWN.reason)
    })

    setTimeout(() => {
        console.log('forced exit after timeout')
        process.exit(1);
    }, 5_000).unref();
}