-- Enable RLS on the chat_history table (if not already enabled)
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anonymous reads (SELECT)
-- This allows your app to read past chat sessions from the table without authentication
CREATE POLICY "Allow public read access to chat_history"
ON chat_history
FOR SELECT
TO anon
USING (true);

-- Policy 2: Allow anonymous inserts (INSERT)
-- This allows your app to save new messages from the user and Daimon
CREATE POLICY "Allow public insert access to chat_history"
ON chat_history
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy 3: Allow anonymous deletes (DELETE)
-- For resetting memory or cleaning up sessions
CREATE POLICY "Allow public delete access to chat_history"
ON chat_history
FOR DELETE
TO anon
USING (true);
