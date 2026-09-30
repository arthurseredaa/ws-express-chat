import express from 'express';
import bcrypt from 'bcryptjs';
import {db} from '../db/index.ts';
import {getNormalizedCredentials} from '../lib/get-normalized-credentials.ts';
import {signAuthToken} from '../lib/auth-token.ts';

export const authRoutes = express.Router();

// SQLITE_CONSTRAINT_UNIQUE: the email is already taken
const SQLITE_UNIQUE_VIOLATION = 2067;

const isUniqueViolation = (error: unknown): boolean =>
    error instanceof Error && 'errcode' in error && error.errcode === SQLITE_UNIQUE_VIOLATION;

authRoutes.post('/register', async (req, res) => {
    const credentials = getNormalizedCredentials(req.body);

    if (!credentials) {
        return res.status(400).send({error: 'Invalid credentials'});
    }

    const hashedPassword = await bcrypt.hash(credentials.password, 10);

    try {
        const result = db.prepare(`
            INSERT INTO users(email, password)
            VALUES ($email, $password)
        `).run({email: credentials.email, password: hashedPassword});

        // lastInsertRowid can be a bigint, which JSON (and therefore JWT) cannot serialize
        const token = signAuthToken({id: Number(result.lastInsertRowid), email: credentials.email});

        return res.status(201).send({token});
    } catch (error) {
        if (isUniqueViolation(error)) {
            return res.status(409).send({error: 'User with that email already exists'});
        }

        console.error(error);
        return res.status(500).send({error: 'Internal server error'});
    }
});

authRoutes.post('/login', async (req, res) => {
    const credentials = getNormalizedCredentials(req.body);

    if (!credentials) {
        return res.status(400).send({error: 'Invalid credentials'});
    }

    const user = db.prepare(`
        SELECT id, password
        FROM users
        WHERE email = $email
    `).get({email: credentials.email});

    const isPasswordValid =
        typeof user?.password === 'string' && await bcrypt.compare(credentials.password, user.password);

    if (!user || !isPasswordValid) {
        return res.status(401).send({error: 'Email or password are invalid, please try again'});
    }

    return res.status(200).send({token: signAuthToken({id: Number(user.id), email: credentials.email})});
});
