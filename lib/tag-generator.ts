

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
 * Generates a base tag suggestion from user name
 * e.g., "John Doe" -> "john.doe"
 */
export function generateBaseTag(firstName: string, lastName: string): string {
    const base = `${firstName}.${lastName}`.toLowerCase()
    // Remove special chars, keep dots and underscores
    return base.replace(/[^a-z0-9._]/g, '')
}

/**
 * Formats a tag for display
 * e.g., "john.doe" -> "@john.doe"
 */
export function formatTag(tag: string | null): string {
    if (!tag) return ''
    return tag.startsWith('@') ? tag : `@${tag}`
}
