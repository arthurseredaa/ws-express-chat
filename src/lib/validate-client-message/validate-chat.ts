import {MESSAGE_LENGTH_LIMIT} from "../../constants.ts";
import type {ChatMessage} from "../../types.ts";

export const validateChat = (data: object): ChatMessage | null => {
    if (!('text' in data)) return null
    if (typeof data.text !== 'string') return null;

    const textTrimmed = data.text.trim();

    if (!textTrimmed) return null;
    if (textTrimmed.length > MESSAGE_LENGTH_LIMIT) return null;

    return {
        type: 'chat',
        text: textTrimmed,
    }
}
