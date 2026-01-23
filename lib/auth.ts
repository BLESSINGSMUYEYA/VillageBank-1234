import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
    throw new Error('JWT_SECRET environment variable is not defined');
}
const key = new TextEncoder().encode(SECRET_KEY);

export async function signToken(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1d') // 1 day
        .sign(key);
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, key);
        return payload;
    } catch (error) {
        return null;
    }
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    const payload = await verifyToken(token);
    return payload ? {
        userId: payload.userId as string,
        role: payload.role as string,
        ...payload
    } : null;
}

export interface SessionPayload {
    userId: string;
    role: string;
    [key: string]: any;
}

export async function getSessionFromRequest(request: NextRequest): Promise<SessionPayload | null> {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return null;
    const payload = await verifyToken(token);
    return payload ? {
        userId: payload.userId as string,
        role: payload.role as string,
        ...payload
    } : null;
}
