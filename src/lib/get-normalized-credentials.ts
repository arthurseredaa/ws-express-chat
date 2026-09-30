const MIN_PASSWORD_LENGTH = 6;

export type Credentials = {
    email: string;
    password: string;
};

// Same rules as in backend_full_course/chapter_3, rewritten to narrow `unknown` instead of trusting the body
export const getNormalizedCredentials = (body: unknown): Credentials | null => {
    if (typeof body !== 'object' || !body) return null;

    if (!('email' in body) || typeof body.email !== 'string') return null;

    if (!('password' in body) || typeof body.password !== 'string') return null;

    const email = body.email.trim().toLowerCase();
    const password = body.password.trim();

    if (!email.includes('@')) return null;

    if (password.length < MIN_PASSWORD_LENGTH) return null;

    return {email, password};
};
