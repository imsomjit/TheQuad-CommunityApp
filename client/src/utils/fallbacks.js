/**
 * A list of soft, visually pleasing gradient pairs.
 */
const softGradients = [
    ["#ff9a9e", "#fecfef"],
    ["#a18cd1", "#fbc2eb"],
    ["#84fab0", "#8fd3f4"],
    ["#a1c4fd", "#c2e9fb"],
    ["#ffecd2", "#fcb69f"],
    ["#fbc2eb", "#a6c1ee"],
    ["#fdcbf1", "#e6dee9"],
    ["#a6c0fe", "#f68084"],
    ["#fccb90", "#d57eeb"],
    ["#e0c3fc", "#8ec5fc"],
    ["#4facfe", "#00f2fe"],
    ["#43e97b", "#38f9d7"],
    ["#fa709a", "#fee140"],
    ["#667eea", "#764ba2"],
];

/**
 * Generates an SVG data URI with initials for user avatars.
 */
export function getAvatarFallback(name, username) {
    const seed = encodeURIComponent(username || name || "default");
    return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`;
}

/**
 * Generates an SVG data URI with a soft random gradient for user banners.
 */
export function getBannerFallback(username) {
    // Pseudo-random based on username so it stays consistent for the same user
    const hash = String(username || "banner").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) * 7;
    const [color1, color2] = softGradients[hash % softGradients.length];
    
    // Random angle
    const angle = (hash * 17) % 360;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
            <linearGradient id="bannerGrad" gradientTransform="rotate(${angle})">
                <stop offset="0%" stop-color="${color1}" />
                <stop offset="100%" stop-color="${color2}" />
            </linearGradient>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bannerGrad)" />
        <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
