import type {ClientMessage} from "../types.ts";
import {MESSAGE_LENGTH_LIMIT} from "../constants.ts";

export const validateClientMessage = (data: unknown): ClientMessage | null => {
    if (typeof data !== 'object' || !data) return null;

    if (!('type' in data )) return null;

    if (!('text' in data)) return null

    if (typeof data.text !== 'string' || typeof data.type !== 'string') return null;

    if (data.type !== 'chat') return null;

    const dataTrimmed = data.text.trim();

    if (!dataTrimmed) return null;

    if (dataTrimmed.length > MESSAGE_LENGTH_LIMIT) return null;

    return {
        type: data.type,
        text: dataTrimmed,
    };
}
