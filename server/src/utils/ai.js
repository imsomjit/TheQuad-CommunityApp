const { GoogleGenAI } = require("@google/genai");
const AppError = require("./AppError");

// Initialize the Google GenAI SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Multi-model routing strategy to manage rate limits and balance cost/performance.
 * @param {'simple' | 'complex' | 'chat'} taskType 
 * @returns {string} The model name
 */
const routeModel = (taskType) => {
  switch (taskType) {
    case 'simple':
      // Extremely fast, highly generous rate limits (1500 RPM / day limit high). Good for tags/JSON.
      return "gemini-2.0-flash-lite-001";
    case 'complex':
      // High reasoning, used for PDF metadata extraction. Rate limit is 15 RPM.
      return "gemini-3.5-flash";
    case 'chat':
      // Conversational Q&A. Good balance of context window and reasoning.
      return "gemini-2.0-flash-lite-001"; 
    default:
      return "gemini-3.5-flash";
  }
}

/**
 * Generate a TL;DR and tags for a given post.
 * @param {string} title - The title of the post
 * @param {string} content - The body/content of the post
 * @returns {Promise<{tldr: string, tags: string[]}>}
 */
const generateTagsAndTldr = async (title, content) => {
  if (!process.env.GEMINI_API_KEY) {
    return { tldr: null, tags: [] };
  }

  const prompt = `
You are an expert technical writer and AI assistant for a community platform.
Analyze the following blog post or question. 
1. Create a concise TL;DR (1-2 sentences maximum).
2. Generate 3 to 5 highly relevant tags (single words or short hyphenated phrases, lowercase).

Title: ${title}

Content:
${content}

Return the result EXACTLY as a valid JSON object with the following shape, and nothing else (no markdown blocks, no backticks):
{
  "tldr": "...",
  "tags": ["tag1", "tag2"]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: routeModel('simple'),
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    const text = response.text;
    const data = JSON.parse(text);
    
    return {
      tldr: data.tldr || null,
      tags: data.tags || [],
    };
  } catch (error) {
    console.error("Error generating tags and TL;DR:", error);
    const isQuota = error.status === 429 || error.message?.includes("429") || error.message?.includes("Quota");
    throw new AppError(isQuota ? "AI services are currently out of quota. Please try again later." : "Failed to generate AI content", isQuota ? 429 : 500);
  }
};

const embeddingCache = new Map();

/**
 * Generate a vector embedding for the given text.
 * @param {string} text 
 * @returns {Promise<number[]>}
 */
const generateEmbedding = async (text) => {
  if (!text || !process.env.GEMINI_API_KEY) return null;

  const cacheKey = text.trim().toLowerCase();
  
  if (embeddingCache.has(cacheKey)) {
    return embeddingCache.get(cacheKey);
  }

  const promise = (async () => {
    try {
      const response = await ai.models.embedContent({
        model: "gemini-embedding-2",
        contents: text,
      });
      return response.embeddings[0].values;
    } catch (error) {
      console.error("Error generating embedding:", error);
      embeddingCache.delete(cacheKey);
      const isQuota = error.status === 429 || error.message?.includes("429") || error.message?.includes("Quota");
      throw new AppError(isQuota ? "AI services are currently out of quota." : "Failed to generate embedding", isQuota ? 429 : 500);
    }
  })();

  embeddingCache.set(cacheKey, promise);

  // Simple cleanup to prevent unbounded growth
  if (embeddingCache.size > 1000) {
    const firstKey = embeddingCache.keys().next().value;
    embeddingCache.delete(firstKey);
  }

  return promise;
};

/**
 * Extract structured metadata from raw PDF text.
 * @param {string} text 
 * @returns {Promise<object>}
 */
const extractPDFMetadata = async (text) => {
  if (!process.env.GEMINI_API_KEY) return null;

  const prompt = `
You are an expert AI assistant tasked with analyzing an academic document (PDF).
Extract the following metadata from the text below:
1. title: The title of the document (keep it concise).
2. description: A brief summary of what this document covers (2-3 sentences).
3. tags: 3 to 5 relevant technical tags (lowercase, hyphenated).
4. college: The name of the college/university if mentioned, otherwise null.
5. branch: The engineering branch (e.g., Computer Science, Electrical) if mentioned, otherwise null.
6. semester: The semester number (integer) if mentioned, otherwise null.
7. subject: The academic subject name if mentioned, otherwise null.

Respond EXACTLY with a valid JSON object matching the shape:
{
  "title": "...",
  "description": "...",
  "tags": ["..."],
  "college": "...",
  "branch": "...",
  "semester": null,
  "subject": "..."
}

Text:
${text.substring(0, 30000)} // Read up to ~10,000 words for metadata
`;

  try {
    const response = await ai.models.generateContent({
      model: routeModel('complex'),
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error extracting PDF metadata:", error);
    const isQuota = error.status === 429 || error.message?.includes("429") || error.message?.includes("Quota");
    throw new AppError(isQuota ? "AI services are currently out of quota. Please try again later." : "Failed to extract metadata", isQuota ? 429 : 500);
  }
};

/**
 * Chat with a PDF document.
 * @param {string} pdfText 
 * @param {Array} history 
 * @param {string} message 
 * @returns {Promise<string>}
 */
const chatWithPDF = async (pdfText, history, message) => {
  if (!process.env.GEMINI_API_KEY) return "AI is currently disabled.";

  const systemInstruction = `
You are an intelligent tutor answering questions about a specific document.
Use the document text provided below to inform your answers. If the answer is not in the document, you can use your general knowledge but mention that it's not explicitly stated in the document.

--- DOCUMENT START ---
${pdfText.substring(0, 150000)} // Truncate if insanely large to avoid limits
--- DOCUMENT END ---
`;

  try {
    // We append the system instruction as the very first message or as a system instruction config if available.
    // The new @google/genai supports systemInstruction config
    
    const contents = history.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: routeModel('chat'),
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Error chatting with PDF:", error);
    const isQuota = error.status === 429 || error.message?.includes("429") || error.message?.includes("Quota");
    throw new AppError(isQuota ? "AI services are currently out of quota. Please try again later." : "Failed to chat with PDF", isQuota ? 429 : 500);
  }
};

module.exports = {
  generateTagsAndTldr,
  generateEmbedding,
  extractPDFMetadata,
  chatWithPDF,
};
