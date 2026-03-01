import { useState } from 'react';
import type { Message } from '../types';
import { MOCK_CONVERSATION } from '../data/mockConversation';
import { DAIMON_SYSTEM_PERSONA } from '../lib/persona';
import { retrieveRelevantJournals, formatContext } from '../lib/rag';
import { streamDaimonResponse } from '../lib/gemini';

export function useChat() {
    const [messages, setMessages] = useState<Message[]>(MOCK_CONVERSATION);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const currentInput = inputValue;
        const newUserMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: currentInput,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');
        setIsTyping(true);

        const daimonMsgId = (Date.now() + 1).toString();
        let daimonText = '';

        try {
            // 1. Retrieve Context from Supabase
            const contextChunks = await retrieveRelevantJournals(currentInput);
            const formattedContext = formatContext(contextChunks);

            // 2. Construct Prompt
            const prompt = DAIMON_SYSTEM_PERSONA.replace('{context}', formattedContext) + '\n\nUser Input: ' + currentInput;

            // 3. Call Gemini (Streaming)
            const responseStream = await streamDaimonResponse(prompt, messages);

            // 4. Create an empty message placeholder in state
            setIsTyping(false); // We got the stream connection, stop the spinning loader
            setMessages(prev => [...prev, {
                id: daimonMsgId,
                role: 'daimon',
                text: '',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);

            // 5. Stream the chunks to the UI
            for await (const chunk of responseStream) {
                if (chunk.text) {
                    daimonText += chunk.text;
                    setMessages(prev => prev.map(msg =>
                        msg.id === daimonMsgId ? { ...msg, text: daimonText } : msg
                    ));
                }
            }

        } catch (error) {
            console.error('Error in chat pipeline:', error);
            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: daimonMsgId,
                role: 'daimon',
                text: "*Connection to memory core severed. I am unable to process that right now.*",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }
    };

    return { messages, inputValue, setInputValue, isTyping, handleSend };
}
