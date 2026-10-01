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

export type CreateRoomMessage = {
    type: 'create_room',
    room: string;
}

export type LeaveRoomMessage = {
    type: 'leave_room',
}

export type ClientMessage = ChatMessage | JoinRoomMessage | CreateRoomMessage | LeaveRoomMessage