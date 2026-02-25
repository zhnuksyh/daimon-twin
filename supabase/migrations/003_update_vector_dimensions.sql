-- Revert: keep 768 dimensions (compatible with IVFFlat index)
-- The ingestion script requests 768-dim output from gemini-embedding-001
-- No schema changes needed — this migration is a no-op placeholder

-- If you already ran 003 and it failed, no action needed.
-- The original schema with VECTOR(768) is correct.
