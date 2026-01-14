
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
 * e.g., "john.doe.m@ubank" -> "@john.doe.m@ubank"
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
 * Generates a unique uBank ID
 * Format: firstname.lastname.m@ubank
 * Fallback: firstname.lastname{random}.m@ubank
 */
export async function generateUniqueUbankId(name: string, type: 'USER' | 'GROUP'): Promise<string> {
    const base = sanitizeForId(name)
    const suffix = type === 'USER' ? '.m@ubank' : '.g@ubank'

    // Try base name first
    const primaryId = `${base}${suffix}`

    // Check collision in both tables to be safe (though suffix separates them usually)
    // But conceptually, IDs should be globally unique or just unique per table. 
    // Given the suffix, they are unique per table effectively.

    const isTaken = async (id: string) => {
        if (type === 'USER') {
            const user = await prisma.user.findUnique({ where: { ubankId: id } })
            return !!user
        } else {
            const group = await prisma.group.findUnique({ where: { ubankId: id } })
            return !!group
        }
    }

    if (!(await isTaken(primaryId))) {
        return primaryId
    }

    // Try up to 10 times with increasing numbers
    for (let i = 1; i <= 10; i++) {
        const candidate = `${base}${i}${suffix}`
        if (!(await isTaken(candidate))) {
            return candidate
        }
    }

    // Fallback: use timestamp if highly congested
    return `${base}${Date.now()}${suffix}`
}
