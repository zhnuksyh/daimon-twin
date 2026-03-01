import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

if (!apiKey) {
    throw new Error('Missing VITE_GOOGLE_API_KEY. Please check your .env file.');
}

export const ai = new GoogleGenAI({ apiKey });

// ============================================
// EMBEDDING (For RAG Querying)
// ============================================
export async function embedQuery(text: string): Promise<{ values: number[], tokens: number }> {
    const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: text,
        config: { outputDimensionality: 768 },
    });

    if (!response.embeddings || response.embeddings.length === 0 || !response.embeddings[0].values) {
        throw new Error('Failed to generate embedding for query.');
    }

    // Embedding API doesn't cleanly return usageMetadata in all SDK versions,
    // so we estimate roughly 4 characters per token.
    const estimatedTokens = Math.ceil(text.length / 4);

    return {
        values: response.embeddings[0].values,
        tokens: estimatedTokens
    };
}

// ============================================
// GENERATION (Streaming Response)
// ============================================
export async function streamDaimonResponse(prompt: string, history: { role: string, text: string }[]) {
    // Convert our chat_history format to Gemini's expected Content format
    const contents = history.map(msg => ({
        role: msg.role === 'daimon' ? 'model' : 'user',
        parts: [{ text: msg.text }]
    }));

    // Add the current prompt (which includes System Persona + Context + User Input)
    contents.push({
        role: 'user',
        parts: [{ text: prompt }]
    });

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
        }
    });

    return responseStream;
}
