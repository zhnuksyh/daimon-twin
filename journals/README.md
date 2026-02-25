# Journal Entries

Place your markdown journal files (`.md`) in this directory. They will be processed by the ingestion script (`scripts/ingest.ts`) and uploaded to Supabase as vector embeddings for RAG context retrieval.

## Expected Format

Each file should be a standard markdown document. The ingestion script will:
1. Read each `.md` file from this directory.
2. Split the content into semantic chunks.
3. Generate vector embeddings using Google's `text-embedding-004`.
4. Store the chunks and embeddings in Supabase `journal_embeddings` table.
