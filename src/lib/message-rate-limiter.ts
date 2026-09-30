export class MessageRateLimiter {
    #windowStart: number;
    #messageCount: number;
    #messageLimit: number;
    #rateLimitWindow: number;

    constructor(messageLimit: number, rateLimitWindow: number) {
        this.#windowStart = Date.now();
        this.#messageCount = 0;

        this.#messageLimit = messageLimit;
        this.#rateLimitWindow = rateLimitWindow;
    }

    isAllowed() {
        const now = Date.now();
        const isWindowTimeLimitExceeded = now - this.#windowStart > this.#rateLimitWindow;

        if (isWindowTimeLimitExceeded) {
            this.#windowStart = now;
            this.#messageCount = 0
        }

        this.#messageCount += 1;

        return this.#messageCount <= this.#messageLimit;
    }
}