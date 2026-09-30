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
