import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

// ============================================
// CONFIG
// ============================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JOURNALS_DIR = path.resolve(__dirname, '../journals');
const CHUNK_SIZE = 800;    // characters per chunk
const CHUNK_OVERLAP = 200; // overlap between chunks for context continuity
const EMBEDDING_MODEL = 'gemini-embedding-001';

// ============================================
// CLIENTS
// ============================================
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const googleApiKey = process.env.VITE_GOOGLE_API_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
}
if (!googleApiKey) {
    throw new Error('Missing VITE_GOOGLE_API_KEY in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);
const ai = new GoogleGenAI({ apiKey: googleApiKey });

// ============================================
// TEXT CHUNKING
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

        // Try to break at a paragraph or sentence boundary
        if (end < text.length) {
            const paragraphBreak = text.lastIndexOf('\n\n', end);
            const sentenceBreak = text.lastIndexOf('. ', end);

            if (paragraphBreak > start + chunkSize / 2) {
                end = paragraphBreak + 2;
            } else if (sentenceBreak > start + chunkSize / 2) {
                end = sentenceBreak + 2;
            }
        }

        const chunkText = text.slice(start, end).trim();
        if (chunkText.length > 0) {
            chunks.push({ text: chunkText, index });
            index++;
        }

        start = end - overlap;
        if (start >= text.length) break;
    }

    return chunks;
}

// ============================================
// EMBEDDING
// ============================================
async function generateEmbedding(text: string): Promise<number[]> {
    const response = await ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: text,
        config: { outputDimensionality: 768 },
    });
    return response.embeddings![0].values!;
}

// ============================================
// FILE DISCOVERY
// ============================================
function getJournalFiles(): string[] {
    if (!fs.existsSync(JOURNALS_DIR)) {
        console.error(`Journals directory not found: ${JOURNALS_DIR}`);
        process.exit(1);
    }

    return fs.readdirSync(JOURNALS_DIR)
        .filter(f => f.endsWith('.md') && f !== 'README.md')
        .map(f => path.join(JOURNALS_DIR, f));
}

// ============================================
// CHECK FOR EXISTING FILES IN DB
// ============================================
async function getExistingFiles(): Promise<Set<string>> {
    const { data, error } = await supabase
        .from('journal_embeddings')
        .select('source_file')
        .order('source_file');

    if (error) {
        console.error('Error fetching existing files:', error.message);
        return new Set();
    }

    return new Set(data?.map(row => row.source_file) ?? []);
}

// ============================================
// PARSE JOURNAL FILE
// ============================================
interface ParsedJournal {
    filename: string;
    title: string;
    date: string;
    tags: string[];
    content: string;
}

function parseJournal(filePath: string): ParsedJournal {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(raw);

    return {
        filename: path.basename(filePath),
        title: frontmatter.title || path.basename(filePath, '.md'),
        date: frontmatter.date || 'unknown',
        tags: frontmatter.tags || [],
        content: content.trim(),
    };
}

// ============================================
// INGEST A SINGLE JOURNAL
// ============================================
async function ingestJournal(journal: ParsedJournal): Promise<number> {
    const chunks = chunkText(journal.content, CHUNK_SIZE, CHUNK_OVERLAP);
    let ingested = 0;

    console.log(`  → ${chunks.length} chunk(s) to embed`);

    for (const chunk of chunks) {
        // Prepend metadata context so the embedding captures when/what the entry is about
        const enrichedText = `[Journal Entry: "${journal.title}" | Date: ${journal.date} | Tags: ${journal.tags.join(', ')}]\n\n${chunk.text}`;

        try {
            const embedding = await generateEmbedding(enrichedText);

            const { error } = await supabase
                .from('journal_embeddings')
                .upsert(
                    {
                        source_file: journal.filename,
                        chunk_index: chunk.index,
                        content: chunk.text,
                        embedding: embedding,
                        metadata: {
                            title: journal.title,
                            date: journal.date,
                            tags: journal.tags,
                            char_count: chunk.text.length,
                        },
                    },
                    { onConflict: 'source_file,chunk_index' }
                );

            if (error) {
                console.error(`  ✕ Chunk ${chunk.index} failed:`, error.message);
            } else {
                ingested++;
                console.log(`  ✓ Chunk ${chunk.index} embedded (${chunk.text.length} chars)`);
            }
        } catch (err) {
            console.error(`  ✕ Chunk ${chunk.index} embedding failed:`, err);
        }

        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    return ingested;
}

// ============================================
// MAIN
// ============================================
async function main() {
    const forceFlag = process.argv.includes('--force');

    console.log('╔══════════════════════════════════════╗');
    console.log('║  Daimon Twin - Journal Ingestion     ║');
    console.log('╚══════════════════════════════════════╝');
    console.log();

    const files = getJournalFiles();
    if (files.length === 0) {
        console.log('No journal files found in', JOURNALS_DIR);
        return;
    }

    console.log(`Found ${files.length} journal file(s)`);

    const existingFiles = await getExistingFiles();
    let totalIngested = 0;
    let skipped = 0;

    for (const filePath of files) {
        const journal = parseJournal(filePath);
        console.log(`\n📄 ${journal.filename} — "${journal.title}"`);

        // Skip if already ingested (unless --force flag is used)
        if (existingFiles.has(journal.filename) && !forceFlag) {
            console.log('  ⏭ Already ingested. Skipping. (use --force to re-ingest)');
            skipped++;
            continue;
        }

        // If forcing re-ingest, delete old chunks first
        if (existingFiles.has(journal.filename) && forceFlag) {
            console.log('  🔄 Force re-ingesting. Deleting old chunks...');
            const { error } = await supabase
                .from('journal_embeddings')
                .delete()
                .eq('source_file', journal.filename);

            if (error) {
                console.error('  ✕ Failed to delete old chunks:', error.message);
                continue;
            }
        }

        const count = await ingestJournal(journal);
        totalIngested += count;
    }

    console.log('\n══════════════════════════════════════');
    console.log(`✅ Done! ${totalIngested} chunk(s) ingested, ${skipped} file(s) skipped.`);
    console.log('══════════════════════════════════════');
}

main().catch(console.error);
