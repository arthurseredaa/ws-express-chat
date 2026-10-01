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
} | {
    type: 'room_joined';
    room: string;
    members: number[];
}

export type ChatMessage = {
    type: 'chat',
    text: string;
}

export type JoinRoomMessage = {
    type: 'join_room',
    room: string;
}

export type ClientMessage = ChatMessage | JoinRoomMessage