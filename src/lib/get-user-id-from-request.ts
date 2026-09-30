import type {IncomingMessage} from 'node:http';
import jwt from 'jsonwebtoken';
import {JWT_SECRET} from './auth-token.ts';

export const getUserIdFromRequest = (request: IncomingMessage): number | null => {
    const token = new URL(request.url ?? '/', 'http://localhost').searchParams.get('token')

    if (!token) return null;

    let payload = null;

    try {
        payload = jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.error('Unable to get user id from request');
        return null;
    }

    if (!payload || typeof payload === 'string') return null;

    if (!('id' in payload) || typeof payload.id !== 'number') return null;

    return payload.id;
};
