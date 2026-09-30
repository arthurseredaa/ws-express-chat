export const HEARTBEAT_INTERVAL = 10_000;
export const MAX_WS_PAYLOAD = 4096; // 4kb
export const MESSAGE_LENGTH_LIMIT = 500;

export const MESSAGE_COUNT_LIMIT = 5;
export const RATE_LIMIT_WINDOW = 5_000;

export const CloseError = {
    RATE_LIMIT_EXCEEDED: {
        code: 4001,
        reason: 'Rate limit exceeded',
    },
    INVALID_MESSAGE: {
        code: 4002,
        reason: 'Invalid message',
    },
    UNAUTHORIZED: {
        code: 4003,
        reason: 'Unauthorized',
    }
} as const;

export type CloseErrorType = typeof CloseError[keyof typeof CloseError];
