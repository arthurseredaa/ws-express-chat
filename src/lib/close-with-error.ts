import type {WebSocket} from "ws";
import type {CloseErrorType} from "../constants.ts";

export const closeWithError = (ws: WebSocket, error: CloseErrorType) => {
    ws.close(error.code, error.reason);
}