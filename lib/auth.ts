import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const SECRET_KEY = process.env.JWT_SECRET || 'super-secret-key-change-this';
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

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    return await verifyToken(token);
}

export async function getSessionFromRequest(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return null;
    const payload = await verifyToken(token);
    return payload ? { userId: payload.userId as string, ...payload } : null;
}
