export type ServerMessage = {
    type: 'chat';
    clientId: number;
    text: string;
} | {
    type: 'leave';
    clientId: number;
} | {
    type: 'join';
    clientId: number;
}

export type ClientMessage = {
    type: 'chat',
    text: string;
}