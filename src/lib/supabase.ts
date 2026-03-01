import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ChatSession {
    session_id: string;
    first_message: string;
    created_at: string;
    title?: string;
}

export async function saveMessageToHistory(sessionId: string, role: 'user' | 'daimon', text: string) {
    const { error } = await supabase
        .from('chat_history')
        .insert({
            session_id: sessionId,
            role,
            text
        });

    if (error) {
        console.error('Failed to save message to history:', error);
    }
}

export async function fetchSessions(): Promise<ChatSession[]> {
    // We want unique sessions, ideally grabbing the earliest user message as the title.
    const { data, error } = await supabase
        .from('chat_history')
        .select('session_id, text, created_at, title')
        .eq('role', 'user')
        .order('created_at', { ascending: true }); // Ascending so the first message for a session is first

    if (error) {
        console.error('Failed to fetch sessions:', error);
        return [];
    }

    // Deduplicate to get only the first message per session
    const sessionsMap = new Map<string, ChatSession>();
    for (const row of (data || [])) {
        if (!sessionsMap.has(row.session_id)) {
            sessionsMap.set(row.session_id, {
                session_id: row.session_id,
                first_message: row.text,
                created_at: row.created_at,
                title: row.title
            });
        }
    }

    // Return descending (newest sessions first)
    return Array.from(sessionsMap.values()).sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}

export async function fetchSessionMessages(sessionId: string) {
    const { data, error } = await supabase
        .from('chat_history')
        .select('id, role, text, timestamp')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Failed to fetch session messages:', error);
        return [];
    }

    // Map to the app's Message type
    return data.map(row => ({
        id: row.id,
        role: row.role as 'user' | 'daimon',
        text: row.text,
        // pg returns timestamp as ISO or string, format just the time
        timestamp: new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
}

export async function deleteSession(sessionId: string) {
    const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('session_id', sessionId);

    if (error) {
        console.error('Failed to delete session:', error);
    }
}

export async function renameSession(sessionId: string, newTitle: string) {
    const { error } = await supabase
        .from('chat_history')
        .update({ title: newTitle })
        .eq('session_id', sessionId);

    if (error) {
        console.error('Failed to rename session:', error);
    }
}

export async function logApiUsage(
    operationType: 'chat' | 'embed_query' | 'embed_chunk',
    model: string,
    promptTokens: number,
    candidatesTokens: number,
    totalTokens: number
) {
    const { error } = await supabase
        .from('api_usage')
        .insert({
            operation_type: operationType,
            model,
            prompt_tokens: promptTokens,
            candidates_tokens: candidatesTokens,
            total_tokens: totalTokens
        });

    if (error) {
        console.error('Failed to log API usage:', error);
    }
}

export interface UsageStats {
    todayTokens: number;
    todayRequests: number;
    monthTokens: number;
    totalTokens: number;
    byOperation: { operation_type: string; count: number; tokens: number }[];
}

export async function fetchUsageStats(): Promise<UsageStats> {
    const { data, error } = await supabase
        .from('api_usage')
        .select('created_at, operation_type, total_tokens');

    if (error) {
        console.error('Failed to fetch usage stats:', error);
        return { todayTokens: 0, todayRequests: 0, monthTokens: 0, totalTokens: 0, byOperation: [] };
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let todayTokens = 0;
    let todayRequests = 0;
    let monthTokens = 0;
    let totalTokens = 0;
    const opStats: Record<string, { count: number; tokens: number }> = {};

    for (const row of data || []) {
        const date = new Date(row.created_at);
        totalTokens += row.total_tokens;

        if (date >= startOfDay) {
            todayTokens += row.total_tokens;
            todayRequests += 1;
        }
        if (date >= startOfMonth) monthTokens += row.total_tokens;

        if (!opStats[row.operation_type]) {
            opStats[row.operation_type] = { count: 0, tokens: 0 };
        }
        opStats[row.operation_type].count += 1;
        opStats[row.operation_type].tokens += row.total_tokens;
    }

    const byOperation = Object.entries(opStats).map(([op, stats]) => ({
        operation_type: op,
        count: stats.count,
        tokens: stats.tokens
    })).sort((a, b) => b.tokens - a.tokens);

    return { todayTokens, todayRequests, monthTokens, totalTokens, byOperation };
}

