import { useState } from 'react';
import type { Message } from '../types';
import { MOCK_CONVERSATION } from '../data/mockConversation';

export function useChat() {
    // --- STATE MANAGEMENT ---
    // messages: Stores the chat history for the current session.
    // inputValue: Controlled state for the textarea.
    // isTyping: Manages the UI loading state while waiting for the LLM response.
    const [messages, setMessages] = useState<Message[]>(MOCK_CONVERSATION);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // --- MESSAGE HANDLING (THE CORE LOOP) ---
    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        // 1. Optimistic UI Update: Immediately show user's message
        const newUserMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: inputValue,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');
        setIsTyping(true);

        // 2. MOCKED API PIPELINE
        // IN THE FUTURE, this block will be replaced with:
        // a. Vectorize user input via Supabase/gte-small.
        // b. Query Supabase pgvector for top 3 similar journal entries.
        // c. Construct prompt (System Persona + Retrieved Context + User Input).
        // d. Send to Gemini API and stream response back to UI.
        setTimeout(() => {
            const newDaimonMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'daimon',
                text: "I hear you. The friction between who we are and who we want to be operates at such a subconscious level, it's confusing. But understanding the architecture precedes just writing the code. Let's take it one step at a time.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, newDaimonMsg]);
            setIsTyping(false);
        }, 2000);
    };

    return { messages, inputValue, setInputValue, isTyping, handleSend };
}
