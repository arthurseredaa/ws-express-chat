# Realtime chat

A small chat I built to learn how WebSockets work on the backend: Node.js, TypeScript, `ws`, Express and SQLite. The client is a single HTML page; the focus is the server.

## Run it

```bash
npm install
echo "JWT_SECRET=$(node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')" > .env
npm run dev
```

Open http://localhost:8080, sign up, then create a room or join one by name.

## What I learned

### WebSocket basics
- A WebSocket connection starts as a normal HTTP request with an `Upgrade` header; after that the line stays open and both sides can send at any time
- Plain HTTP to a WebSocket-only server gets `426 Upgrade Required`
- On the server one `WebSocketServer` handles everyone, and each client gets its own socket with its own events: `connection`, `message`, `close`, `error`
- In Node, messages arrive as a `Buffer` (raw bytes); in the browser they arrive as a string
- Text is just bytes in UTF-8: Latin letters take 1 byte, Cyrillic takes 2, so `.length` is not the size in bytes
- Close codes say why a connection ended: `1000` normal, `1001` going away, `1005` no code, `1006` dropped with no goodbye, `4000–4999` are for my own app

### Server state
- The server remembers clients in a `Map`, and each connection keeps its own data in a closure
- Objects are passed by reference, so changing a field on a shared object is visible everywhere it is stored
- A class with `#private` fields gives a piece of shared state a single owner
- Two `Map`s that answer the same question from two sides (room → members, user → room) work like a book's contents page and its index; they must always change together
- Separating data (registries), delivery (sending to sockets) and rules (message handlers) makes each part easy to change and test on its own

### Protocol
- JSON messages with a `type` field, described as a TypeScript discriminated union for both directions
- The server sends facts (`{type: 'join', userId}`) and the client decides how to show them
- Never copy client fields into server messages (`...data`): the server sets `type` and the author itself, otherwise anyone can fake system events
- A snapshot on connect or join (`room_joined` with the member list), followed by small change events (`join`, `leave`, `chat`)
- WebSocket keeps message order on one connection, so a snapshot and the events after it never get mixed up

### Reliability
- Heartbeat with ping/pong finds dead connections (a phone that lost Wi-Fi never sends `close`)
- `ping()` doesn't wait for an answer, so you need an `isAlive` flag between two moments in time
- Late events: the `close` or `pong` of an old socket can arrive after a new socket replaced it, so check that it is still the same socket before changing anything
- Graceful shutdown: on `SIGINT`/`SIGTERM`, stop accepting connections, stop timers, close clients with `1001`, and let Node exit on its own once nothing keeps it alive
- `.unref()` makes a timer stop keeping the process alive
- Client reconnect with exponential backoff and jitter, but not after closes the server made on purpose

### Security
- Never trust the client: everything from the network is `unknown` until it has been parsed and validated
- `maxPayload` stops huge messages before they reach my code
- Wrap `JSON.parse` in a narrow `try/catch`, because one bad message must not crash the server for everyone
- Validators turn `unknown` into a typed message by narrowing it step by step, without `as`, and return a new clean object
- Fixed-window rate limiting against flooding
- Two kinds of mistakes: an honest user's mistake (a room name that's already taken) gets an error reply; something only a broken or malicious client would do gets disconnected
- Client-side limits are only for convenience; real protection lives on the server
- JWT auth for WebSocket: the browser can't set headers, so the token goes in the URL (`?token=`) and is checked before the client gets anything

### Rooms
- A small state machine: lobby ⇄ in a room
- Membership (who is in which room) is not the same as presence (who is online right now)
- One tab per user: a new connection replaces the old one with its own close code
- Rooms are created and joined by name, and an empty room gets deleted
- Rooms are stored in SQLite so they survive a server restart, and the primary key enforces "one room per user"

### TypeScript and Node habits
- Node runs `.ts` directly by stripping types, so imports used only as types need `import type`, and `enum` isn't allowed
- `unknown` instead of `any`, `as const` objects instead of `enum`
- Run `tsc --noEmit` often, because Node doesn't check types at runtime
- Read a stack trace by finding the first line that points to my own file
- Test with two or three clients at once: most bugs only show up from another client's point of view
- Off-by-one bugs: always check the limit itself and the limit plus one
- Small refactoring steps, checking behaviour after each one
