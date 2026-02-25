-- Enable RLS on the table (if not already enabled)
ALTER TABLE journal_embeddings ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anonymous reads (SELECT)
-- This allows your app to read from the table without authentication
CREATE POLICY "Allow public read access"
ON journal_embeddings
FOR SELECT
TO anon
USING (true);

-- Policy 2: Allow anonymous inserts/updates (INSERT, UPDATE)
-- This allows the ingestion script using the anon key to upsert data
CREATE POLICY "Allow public insert and update access"
ON journal_embeddings
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow public update access"
ON journal_embeddings
FOR UPDATE
TO anon
USING (true);

-- Policy 3: Allow anonymous deletes
-- This allows the ingestion script to delete old chunks on --force
CREATE POLICY "Allow public delete access"
ON journal_embeddings
FOR DELETE
TO anon
USING (true);
