import { embedQuery } from './gemini';
import { supabase } from './supabase';

// ============================================
// CONFIG (Matching the Node.js ingest.ts script)
// ============================================
const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 200;

// ============================================
// TEXT CHUNKING (Ported from scripts/ingest.ts)
// ============================================
interface Chunk {
    text: string;
    index: number;
}

function chunkText(text: string, chunkSize: number, overlap: number): Chunk[] {
    const chunks: Chunk[] = [];
    let start = 0;
    let index = 0;

    while (start < text.length) {
        let end = start + chunkSize;

        if (end < text.length) {
            const paragraphBreak = text.lastIndexOf('\n\n', end);
            const sentenceBreak = text.lastIndexOf('. ', end);

            if (paragraphBreak > start + chunkSize / 2) {
                end = paragraphBreak + 2;
            } else if (sentenceBreak > start + chunkSize / 2) {
                end = sentenceBreak + 2;
            }
        }

        const chunkContent = text.slice(start, end).trim();
        if (chunkContent.length > 0) {
            chunks.push({ text: chunkContent, index });
            index++;
        }

        start = end - overlap;
        if (start >= text.length) break;
    }

    return chunks;
}

// ============================================
// PARSE MARKDOWN FRONTMATTER (Lightweight)
// ============================================
interface ParsedFile {
    title: string;
    tags: string[];
    content: string;
}

function parseMarkdownFile(rawText: string, filename: string): ParsedFile {
    // Check for YAML frontmatter delimiters ---
    const fmRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = rawText.match(fmRegex);

    let title = filename.replace(/\.md$/, '');
    let tags: string[] = [];
    let content = rawText;

    if (match) {
        const frontmatter = match[1];
        content = match[2].trim();

        // Extract title
        const titleMatch = frontmatter.match(/^title:\s*(.+)$/m);
        if (titleMatch) title = titleMatch[1].replace(/^["']|["']$/g, '').trim();

        // Extract tags
        const tagsMatch = frontmatter.match(/^tags:\s*\[(.+)\]$/m);
        if (tagsMatch) {
            tags = tagsMatch[1].split(',').map(t => t.trim().replace(/^["']|["']$/g, ''));
        }
    }

    return { title, tags, content };
}

// ============================================
// MAIN: PROCESS AND EMBED A FILE
// ============================================
export interface IngestProgress {
    phase: 'parsing' | 'chunking' | 'embedding' | 'done' | 'error';
    current: number;
    total: number;
    message: string;
}

export async function processAndEmbedFile(
    file: File,
    onProgress: (progress: IngestProgress) => void
): Promise<boolean> {
    try {
        // 1. Read file
        onProgress({ phase: 'parsing', current: 0, total: 1, message: `Reading ${file.name}...` });
        const rawText = await file.text();
        const filename = file.name;

        // 2. Parse
        const parsed = parseMarkdownFile(rawText, filename);
        onProgress({ phase: 'parsing', current: 1, total: 1, message: `Parsed "${parsed.title}"` });

        // 3. Chunk
        const chunks = chunkText(parsed.content, CHUNK_SIZE, CHUNK_OVERLAP);
        onProgress({ phase: 'chunking', current: 0, total: chunks.length, message: `${chunks.length} chunks created` });

        // 4. Delete old data for this file (force re-ingest)
        await supabase
            .from('journal_embeddings')
            .delete()
            .eq('source_file', filename);

        // 5. Embed and upsert each chunk
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const enrichedText = `[Journal Entry: "${parsed.title}" | Tags: ${parsed.tags.join(', ')}]\n\n${chunk.text}`;

            onProgress({
                phase: 'embedding',
                current: i + 1,
                total: chunks.length,
                message: `Embedding chunk ${i + 1}/${chunks.length}...`
            });

            const embedding = await embedQuery(enrichedText);

            const { error } = await supabase
                .from('journal_embeddings')
                .upsert(
                    {
                        source_file: filename,
                        chunk_index: chunk.index,
                        content: chunk.text,
                        embedding: embedding,
                        metadata: {
                            title: parsed.title,
                            tags: parsed.tags,
                            char_count: chunk.text.length,
                        },
                    },
                    { onConflict: 'source_file,chunk_index' }
                );

            if (error) {
                onProgress({ phase: 'error', current: i, total: chunks.length, message: `Chunk ${i} failed: ${error.message}` });
                return false;
            }

            // Small delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 150));
        }

        onProgress({ phase: 'done', current: chunks.length, total: chunks.length, message: `Successfully embedded ${chunks.length} chunks from "${parsed.title}"` });
        return true;

    } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error';
        onProgress({ phase: 'error', current: 0, total: 0, message: errMsg });
        return false;
    }
}

// ============================================
// FETCH INGESTED FILES
// ============================================
export interface IngestedFile {
    source_file: string;
    chunk_count: number;
    title: string;
}

export async function fetchIngestedFiles(): Promise<IngestedFile[]> {
    const { data, error } = await supabase
        .from('journal_embeddings')
        .select('source_file, metadata');

    if (error) {
        console.error('Failed to fetch ingested files:', error);
        return [];
    }

    // Group by source_file
    const fileMap = new Map<string, { count: number; title: string }>();
    for (const row of (data || [])) {
        const existing = fileMap.get(row.source_file);
        if (existing) {
            existing.count++;
        } else {
            fileMap.set(row.source_file, {
                count: 1,
                title: row.metadata?.title || row.source_file
            });
        }
    }

    return Array.from(fileMap.entries())
        .map(([source_file, info]) => ({
            source_file,
            chunk_count: info.count,
            title: info.title,
        }))
        .sort((a, b) => a.source_file.localeCompare(b.source_file));
}

export async function deleteIngestedFile(sourceFile: string) {
    const { error } = await supabase
        .from('journal_embeddings')
        .delete()
        .eq('source_file', sourceFile);

    if (error) {
        console.error('Failed to delete ingested file:', error);
    }
}
