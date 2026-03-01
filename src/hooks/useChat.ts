import { useState } from 'react';
import type { Message } from '../types';
import { MOCK_CONVERSATION } from '../data/mockConversation';
import { DAIMON_SYSTEM_PERSONA } from '../lib/persona';
import { retrieveRelevantJournals, formatContext } from '../lib/rag';
import { streamDaimonResponse } from '../lib/gemini';

interface UseChatConfig {
    setIsWorkbenchOpen: (isOpen: boolean) => void;
    setWorkbenchContent: (updater: (prev: string) => string) => void;
    workbenchContent: string;
}

export function useChat({ setIsWorkbenchOpen, setWorkbenchContent }: UseChatConfig) {
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

        const isDrafting = currentInput.trim().toLowerCase().startsWith('/draft ');
        const draftTopic = isDrafting ? currentInput.trim().slice(7).trim() : '';

        try {
            // 1. Retrieve Context from Supabase
            const contextChunks = await retrieveRelevantJournals(currentInput);
            const formattedContext = formatContext(contextChunks);

            // 2. Construct Prompt (Modify instruction if drafting)
            let promptInstruction = 'User Input: ' + currentInput;
            if (isDrafting) {
                promptInstruction = `The user has requested you to ghostwrite a long-form draft on the following topic/instruction: "${draftTopic}". 
                Write the content purely in Markdown. Do not include conversational filler like "Here is the draft" or "I hope this helps". 
                Draft the content directly, adopting your persona's tone combined with the context provided. Structure the markdown beautifully.`;

                // Ensure workbench is open
                setIsWorkbenchOpen(true);
            }

            const prompt = DAIMON_SYSTEM_PERSONA.replace('{context}', formattedContext) + '\n\n' + promptInstruction;

            // 3. Call Gemini (Streaming)
            const responseStream = await streamDaimonResponse(prompt, messages);

            // 4. Create an empty message placeholder in state
            setIsTyping(false);

            if (isDrafting) {
                setMessages(prev => [...prev, {
                    id: daimonMsgId,
                    role: 'daimon',
                    text: `*Initiated phantom drafting protocol for: **${draftTopic}**. Check the Workbench.*`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);

                // Clear the canvas if it's the default placeholder
                setWorkbenchContent(prev => prev.includes('# The Empty Canvas') ? '' : prev + '\n\n---\n\n');
            } else {
                setMessages(prev => [...prev, {
                    id: daimonMsgId,
                    role: 'daimon',
                    text: '',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
            }

            // 5. Stream the chunks to the UI or Workbench
            for await (const chunk of responseStream) {
                if (chunk.text) {
                    daimonText += chunk.text;
                    if (isDrafting) {
                        setWorkbenchContent(prev => prev + chunk.text);
                    } else {
                        setMessages(prev => prev.map(msg =>
                            msg.id === daimonMsgId ? { ...msg, text: daimonText } : msg
                        ));
                    }
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
