import { supabase } from './supabase';
import { embedQuery } from './gemini';

export interface RetrievedContext {
    id: string;
    content: string;
    source_file: string;
    similarity: number;
}

export async function retrieveRelevantJournals(query: string, limit: number = 3): Promise<RetrievedContext[]> {
    try {
        // 1. Convert user's query text into a vector
        const queryEmbedding = await embedQuery(query);

        // 2. Search Supabase for the most similar chunks
        const { data, error } = await supabase.rpc('match_journal_entries', {
            query_embedding: queryEmbedding,
            match_threshold: 0.5, // Return anything reasonably close
            match_count: limit,
        });

        if (error) {
            console.error('Vector search failed:', error);
            return [];
        }

        return data as RetrievedContext[];
    } catch (err) {
        console.error('Error retrieving context:', err);
        return [];
    }
}

export function formatContext(chunks: RetrievedContext[]): string {
    if (!chunks || chunks.length === 0) return 'No relevant journal context found.';

    return chunks.map(chunk =>
        `---\nSource: ${chunk.source_file}\nSimilarity: ${(chunk.similarity * 100).toFixed(1)}%\n\n${chunk.content}\n---`
    ).join('\n\n');
}
