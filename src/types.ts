export type ServerErrorCode = 'room_exists' | 'room_not_found';

export type ServerErrorMessage = {
    type: 'error',
    code: ServerErrorCode
}

export type ServerMessage = {
    type: 'chat';
    userId: number;
    text: string;
} | {
    type: 'leave';
    userId: number;
} | {
    type: 'join';
    userId: number;
} | {
    type: 'room_joined';
    room: string;
    members: number[];
} | {
    type: 'lobby'
} | ServerErrorMessage

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