import {WebSocketServer} from 'ws';
import express from 'express';
import {createServer} from 'http';
import * as path from "node:path";
import {ClientRegistry} from "./lib/registry/client-registry.ts";
import {startHeartbeat} from "./lib/start-heartbeat.ts";
import {handleConnection} from "./lib/connection.ts";
import {MAX_WS_PAYLOAD} from "./constants.ts";
import {authRoutes} from "./routes/auth.ts";

const app = express()
const server = createServer(app);
const PORT = process.env.PORT || 8080;

const registry = new ClientRegistry();

const wss = new WebSocketServer({server, maxPayload: MAX_WS_PAYLOAD});

app.use(express.json());
app.use(express.static(path.join(import.meta.dirname, './public')));
app.use('/auth', authRoutes);

wss.on('connection', (ws, request) => handleConnection(ws, request, registry));

// TODO: add clearInterval on server shutdown
const heartbeatIntervalId = startHeartbeat(registry);

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
