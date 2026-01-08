
import { prisma } from '@/lib/prisma'

/**
 * Validates if a tag format is correct
 * - Must start with @ (optional in input, but stored without)
 * - Alphanumeric, dots, underscores
 * - Min 3 chars, max 30 chars
 */
export function isValidTagFormat(tag: string): boolean {
    const cleanTag = tag.startsWith('@') ? tag.slice(1) : tag
    const regex = /^[a-zA-Z0-9._]{3,30}$/
    return regex.test(cleanTag)
}

/**
 * Formats a tag for display
 * e.g., "john.doe" -> "@john.doe"
 */
export function formatTag(tag: string | null): string {
    if (!tag) return ''
    return tag.startsWith('@') ? tag : `@${tag}`
}

/**
 * Sanitizes a string for use in a tag
 * - Converts to lowercase
 * - Replaces spaces with dots
 * - Removes non-alphanumeric chars (except dots and underscores)
 */
function sanitizeForTag(input: string): string {
    return input.toLowerCase()
        .replace(/\s+/g, '.') // Replace spaces with dots
        .replace(/[^a-z0-9._]/g, '') // Remove invalid chars
}

/**
 * Generates a unique user tag
 * Format: firstname.lastname.m@ubank
 * Fallback: firstname.lastname{random}.m@ubank
 */
export async function generateUniqueUserTag(firstName: string, lastName: string): Promise<string> {
    const base = sanitizeForTag(`${firstName}.${lastName}`)
    const suffix = '.m@ubank'

    // Try base name first
    const primaryTag = `${base}${suffix}`
    const existing = await prisma.user.findUnique({
        where: { ubankTag: primaryTag }
    })

    if (!existing) {
        return primaryTag
    }

    // Try up to 5 times with random numbers
    for (let i = 0; i < 5; i++) {
        const randomNum = Math.floor(Math.random() * 10000)
        const candidate = `${base}${randomNum}${suffix}`

        const collision = await prisma.user.findUnique({
            where: { ubankTag: candidate }
        })

        if (!collision) {
            return candidate
        }
    }

    // Fallback: use timestamp if highly congested
    return `${base}${Date.now()}${suffix}`
}

/**
 * Generates a unique group tag
 * Format: groupname.g@ubank
 * Fallback: groupname{random}.g@ubank
 */
export async function generateUniqueGroupTag(groupName: string): Promise<string> {
    const base = sanitizeForTag(groupName)
    const suffix = '.g@ubank'

    // Try base name first
    const primaryTag = `${base}${suffix}`
    const existing = await prisma.group.findUnique({
        where: { ubankTag: primaryTag }
    })

    if (!existing) {
        return primaryTag
    }

    // Try up to 5 times with random numbers
    for (let i = 0; i < 5; i++) {
        const randomNum = Math.floor(Math.random() * 10000)
        const candidate = `${base}${randomNum}${suffix}`

        const collision = await prisma.group.findUnique({
            where: { ubankTag: candidate }
        })

        if (!collision) {
            return candidate
        }
    }

    // Fallback: use timestamp if highly congested
    return `${base}${Date.now()}${suffix}`
}
