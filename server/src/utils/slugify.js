/**
 * Extracts the publicId from the end of a slug.
 * Assumes the publicId is exactly 12 characters long.
 * 
 * @param {string} slug 
 * @returns {string} The 12-character publicId
 */
const extractIdFromSlug = (slug) => {
    if (!slug) return null;
    return slug.slice(-12);
};

module.exports = {
    extractIdFromSlug
};
