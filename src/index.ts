import {WebSocketServer} from 'ws';
import express from 'express';
import {createServer} from 'http';
import * as path from "node:path";
import {ClientRegistry} from "./client-registry.ts";
import {startHeartbeat} from "./lib/start-heartbeat.ts";
import {handleConnection} from "./lib/connection.ts";

const app = express()
const server = createServer(app);
const PORT = process.env.PORT || 8080;

const registry = new ClientRegistry();

const wss = new WebSocketServer({server});

app.use(express.static(path.join(import.meta.dirname, './public')));

wss.on('connection', (ws) => handleConnection(ws, registry));

const heartbeatIntervalId = startHeartbeat(registry);

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
