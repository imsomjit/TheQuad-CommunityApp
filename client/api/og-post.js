export default async function handler(req, res) {
  try {
    const { type, id, slug } = req.query;
    const identifier = id || slug;
    
    // Default OG tags
    let title = "PeerVerse | Learners Community Platform";
    let description = "A modern, community-driven platform for learners to share resources, ask questions, and collaborate.";
    let image = "https://peerverse-web.vercel.app/default-og.png"; // Fallback image

    // VITE_API_URL should be available in Vercel environment variables
    const apiUrl = process.env.VITE_API_URL || "https://peerverse-api.onrender.com/api";
    
    if (identifier && type) {
      let endpoint = '';
      if (type === 'post') endpoint = `/posts/${identifier}`;
      else if (type === 'resource') endpoint = `/resources/${identifier}`;
      else if (type === 'book') endpoint = `/books/${identifier}`;
      else if (type === 'opportunity') endpoint = `/opportunities/${identifier}`;
      else if (type === 'question') endpoint = `/questions/${identifier}`;

      if (endpoint) {
        const response = await fetch(`${apiUrl}${endpoint}`);
        if (response.ok) {
          const json = await response.json();
          // The API might wrap the result in "data" or just return the object directly
          const item = json?.data?.post || json?.data?.resource || json?.data?.book || json?.data?.opportunity || json?.data?.question || json?.data || json?.post || json?.resource || json?.book || json?.opportunity || json?.question;
          
          if (item) {
             if (type === 'post') {
               title = `${item.title} | PeerVerse`;
               description = item.excerpt || item.body?.substring(0, 150)?.replace(/<[^>]+>/g, '') || description;
               image = item.coverImageUrl || item.coverUrl || image;
             } else if (type === 'resource') {
               title = `${item.title} | Resource on PeerVerse`;
               description = item.description || description;
               // Resources might not have covers, fallback to default
             } else if (type === 'book') {
               title = `${item.title} by ${item.author || 'Unknown'} | Library`;
               description = item.description || description;
               image = item.coverUrl || item.coverImageUrl || image;
             } else if (type === 'opportunity') {
               title = `${item.title} | Opportunity`;
               description = item.description || description;
             } else if (type === 'question') {
               title = `${item.title} | Forum`;
               description = item.body?.substring(0, 150)?.replace(/<[^>]+>/g, '') || description;
             }
          }
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
    
    // Clean strings for HTML attributes
    const cleanTitle = (title || '').replace(/"/g, '&quot;');
    const cleanDesc = (description || '').replace(/"/g, '&quot;');
    const cleanImage = image || '';

    // Replace or append meta tags before </head>
    const metaTags = `
      <meta property="og:title" content="${cleanTitle}" />
      <meta property="og:description" content="${cleanDesc}" />
      <meta property="og:image" content="${cleanImage}" />
      <meta property="og:type" content="article" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${cleanTitle}" />
      <meta name="twitter:description" content="${cleanDesc}" />
      <meta name="twitter:image" content="${cleanImage}" />
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
