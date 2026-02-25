-- Add unique constraint for deduplication
-- Prevents the same chunk from being inserted twice
ALTER TABLE journal_embeddings
  ADD CONSTRAINT uq_journal_chunk UNIQUE (source_file, chunk_index);
