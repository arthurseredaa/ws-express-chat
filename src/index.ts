import {WebSocketServer} from 'ws';
import express from 'express';
import {createServer} from 'http';
import * as path from "node:path";
import {ClientRegistry} from "./lib/registry/client-registry.ts";
import {startHeartbeat} from "./lib/start-heartbeat.ts";
import {handleConnection} from "./lib/connection.ts";
import {MAX_WS_PAYLOAD} from "./constants.ts";
import {authRoutes} from "./routes/auth.ts";
import {RoomRegistry} from "./lib/registry/room-registry.ts";
import {gracefulShutdown} from "./lib/graceful-shutdown.ts";

const app = express()
const server = createServer(app);
const PORT = process.env.PORT || 8080;

const clientRegistry = new ClientRegistry();
const roomRegistry = new RoomRegistry();

const wss = new WebSocketServer({server, maxPayload: MAX_WS_PAYLOAD});

app.use(express.json());
app.use(express.static(path.join(import.meta.dirname, './public')));
app.use('/auth', authRoutes);

wss.on('connection', (ws, request) => handleConnection({
    ws,
    request,
    clientRegistry,
    roomRegistry
}));

const heartbeatIntervalId = startHeartbeat(clientRegistry);

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

let shutdownStarted = false;

process.on('SIGINT', (code) => {
    if (shutdownStarted) {
        return process.exit(1);
    }

    console.log(`received ${code}, shutting down`)
    shutdownStarted = true;

    gracefulShutdown({
        server,
        heartbeatIntervalId,
        clientRegistry,
    })
})

process.on('SIGTERM', (code) => {
    if (shutdownStarted) {
        return process.exit(1);
    }

    console.log(`received ${code}, shutting down`)
    shutdownStarted = true;

    gracefulShutdown({
        server,
        heartbeatIntervalId,
        clientRegistry,
    })
})