-- Add a title column to allow users to rename sessions 
ALTER TABLE chat_history ADD COLUMN IF NOT EXISTS title TEXT;

-- Policy 4: Allow anonymous updates (UPDATE)
-- This allows your app to rename sessions
CREATE POLICY "Allow public update access to chat_history"
ON chat_history
FOR UPDATE
TO anon
USING (true);
