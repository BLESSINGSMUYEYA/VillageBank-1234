
import { prisma } from '@/lib/prisma'

/**
 * Validates if an ID format is correct
 * - Must start with @ (optional in input, but stored without)
 * - Alphanumeric, dots, underscores
 * - Min 3 chars, max 30 chars
 */
export function isValidIdFormat(id: string): boolean {
    const cleanId = id.startsWith('@') ? id.slice(1) : id
    const regex = /^[a-zA-Z0-9._]{3,30}$/
    return regex.test(cleanId)
}

/**
 * Formats an ID for display
 * e.g., "blessings" -> "@blessings"
 */
export function formatUbankId(id: string | null): string {
    if (!id) return ''
    return id.startsWith('@') ? id : `@${id}`
}

/**
 * Sanitizes a string for use in an ID
 * - Converts to lowercase
 * - Replaces spaces with dots
 * - Removes non-alphanumeric chars (except dots and underscores)
 */
function sanitizeForId(input: string): string {
    return input.toLowerCase()
        .replace(/\s+/g, '.') // Replace spaces with dots
        .replace(/[^a-z0-9._]/g, '') // Remove invalid chars
}

/**
 * Generates a unique uBank ID (Handle Style)
 * Priority:
 * 1. firstname (e.g. "blessings")
 * 2. firstname.lastname (e.g. "blessings.muyeya")
 * 3. firstname + numbers (e.g. "blessings123")
 */
export async function generateUniqueUbankId(firstName: string, lastName: string = '', type: 'USER' | 'GROUP'): Promise<string> {
    const cleanFirst = sanitizeForId(firstName);
    const cleanLast = sanitizeForId(lastName);

    // 1. Try just First Name (Most desirable)
    // e.g. "blessings"
    let candidate = cleanFirst;
    if (candidate.length < 3) candidate = `${candidate}bank`; // Ensure min length

    if (!(await isTaken(candidate, type))) {
        return candidate;
    }

    // 2. Try First.Last
    // e.g. "blessings.muyeya"
    if (cleanLast) {
        candidate = `${cleanFirst}.${cleanLast}`;
        if (!(await isTaken(candidate, type))) {
            return candidate;
        }
    }

    // 3. Try First + Random Number (Short)
    // e.g. "blessings1" to "blessings999"
    for (let i = 1; i <= 20; i++) {
        const num = Math.floor(Math.random() * 999) + 1; // 1-999
        candidate = `${cleanFirst}${num}`;
        if (!(await isTaken(candidate, type))) {
            return candidate;
        }
    }

    // 4. Fallback: Timestamp (Last resort)
    return `${cleanFirst}${Date.now().toString().slice(-4)}`;
}

async function isTaken(id: string, type: 'USER' | 'GROUP'): Promise<boolean> {
    if (type === 'USER') {
        const user = await prisma.user.findUnique({ where: { ubankId: id } });
        return !!user;
    } else {
        const group = await prisma.group.findUnique({ where: { ubankId: id } });
        return !!group;
    }
}
