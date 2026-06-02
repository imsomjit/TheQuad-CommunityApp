/**
 * Generates an SEO-friendly URL slug from a title and a publicId.
 * 
 * Rules:
 * - Lowercases the title
 * - Replaces non-alphanumeric characters with hyphens
 * - Truncates the title portion to 70 characters
 * - Removes leading/trailing hyphens
 * - Appends the publicId at the end
 * 
 * @param {string} title 
 * @param {string} publicId 
 * @returns {string} The formatted slug
 */
export function generateSlug(title, publicId) {
    if (!title) return publicId;
    
    // Slugify the title
    let slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
        .replace(/^-+|-+$/g, '');    // Remove leading and trailing hyphens
        
    // Truncate to 70 chars max for the title part
    if (slug.length > 70) {
        slug = slug.substring(0, 70).replace(/-+$/g, ''); // Ensure it doesn't end with a hyphen
    }

    if (!slug) return publicId;
    
    return `${slug}-${publicId}`;
}

/**
 * Extracts the publicId from the end of a slug.
 * Assumes the publicId is exactly 12 characters long.
 * 
 * @param {string} slug 
 * @returns {string} The 12-character publicId
 */
export function extractIdFromSlug(slug) {
    if (!slug) return null;
    return slug.slice(-12);
}
