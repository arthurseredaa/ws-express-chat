import {type WebSocket} from "ws";
import type {ServerMessage} from "../types.ts";

export const sendServerMessage = (ws: WebSocket, data: ServerMessage) => {
    ws.send(JSON.stringify(data))
}