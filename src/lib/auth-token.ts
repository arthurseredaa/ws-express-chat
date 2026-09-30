import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;

// Fail at startup rather than on the first login: a missing secret is a config error
if (!secret) {
    throw new Error('JWT_SECRET is not set. Run the server with --env-file=.env');
}

export const JWT_SECRET: string = secret;

export type AuthTokenPayload = {
    id: number;
    email: string;
};

export const signAuthToken = (payload: AuthTokenPayload): string =>
    jwt.sign(payload, JWT_SECRET, {expiresIn: '24h'});
