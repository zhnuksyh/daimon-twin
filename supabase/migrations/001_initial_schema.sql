-- Enable pgvector extension (run this first if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- Chat History Table
-- Stores all user and Daimon messages per session.
-- ============================================
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('user', 'daimon')),
  text TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now(),
  session_id UUID DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast session-based lookups
CREATE INDEX IF NOT EXISTS idx_chat_history_session ON chat_history (session_id, created_at);

-- ============================================
-- Journal Embeddings Table
-- Stores chunked markdown journal entries and their vector embeddings.
-- Used by the RAG pipeline to find relevant context.
-- ============================================
CREATE TABLE IF NOT EXISTS journal_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  source_file TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding VECTOR(768),  -- Google text-embedding-004 outputs 768 dimensions
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vector similarity search index (IVFFlat for fast cosine similarity)
CREATE INDEX IF NOT EXISTS idx_journal_embeddings_vector
  ON journal_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Index for source file lookups
CREATE INDEX IF NOT EXISTS idx_journal_embeddings_source ON journal_embeddings (source_file);

-- ============================================
-- RPC Function: Match Journal Entries
-- Called from the app to retrieve the most relevant journal chunks.
-- ============================================
CREATE OR REPLACE FUNCTION match_journal_entries(
  query_embedding VECTOR(768),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  source_file TEXT,
  chunk_index INTEGER,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    je.id,
    je.content,
    je.source_file,
    je.chunk_index,
    1 - (je.embedding <=> query_embedding) AS similarity
  FROM journal_embeddings je
  WHERE 1 - (je.embedding <=> query_embedding) > match_threshold
  ORDER BY je.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
