export default async function handler(req, res) {
  try {
    const slug = req.query.slug;
    
    // Default OG tags
    let title = "PeerVerse | Learners Community Platform";
    let description = "A modern, community-driven platform for learners to share resources, ask questions, and collaborate.";
    let image = "https://peerverse-web.vercel.app/default-og.png"; // Fallback image

    // Try fetching the post
    // VITE_API_URL should be available in Vercel environment variables
    const apiUrl = process.env.VITE_API_URL || "https://peerverse-api.onrender.com/api";
    
    if (slug) {
      const response = await fetch(`${apiUrl}/posts/${slug}`);
      if (response.ok) {
        const json = await response.json();
        const post = json?.data;
        if (post) {
          title = `${post.title} | PeerVerse`;
          description = post.excerpt || description;
          image = post.coverImageUrl || post.coverUrl || image;
        }
      }
    }

    // Determine the host to fetch the original index.html
    const isLocal = !process.env.VERCEL_URL;
    const protocol = isLocal ? 'http' : 'https';
    const host = process.env.VERCEL_URL || req.headers['x-forwarded-host'] || req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    // Fetch the unmodified index.html
    // To avoid infinite loops, we fetch a path we know isn't rewritten to og-post, like /
    const htmlRes = await fetch(`${baseUrl}/`);
    let html = await htmlRes.text();

    // Inject OG tags
    html = html.replace(/<title>.*<\/title>/i, `<title>${title}</title>`);
    
    // Replace or append meta tags before </head>
    const metaTags = `
      <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
      <meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />
      <meta property="og:image" content="${image}" />
      <meta property="og:type" content="article" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
      <meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}" />
      <meta name="twitter:image" content="${image}" />
    </head>`;
    
    html = html.replace('</head>', metaTags);

    // Provide cache headers so Vercel edge CDN caches the result
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300'); // Cache for 60s
    res.status(200).send(html);

  } catch (error) {
    console.error("OG generation error:", error);
    // On error, fallback to redirecting to the root which will then mount SPA and handle routing
    res.redirect("/");
  }
}
