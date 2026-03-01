import { useRef, useEffect } from 'react';
import type { Message } from '../types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

interface ChatAreaProps {
  messages: Message[];
  isTyping: boolean;
}

export default function ChatArea({ messages, isTyping }: ChatAreaProps) {
  // messagesEndRef: Used as a target to auto-scroll the chat view to the bottom.
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- AUTO-SCROLL LOGIC ---
  // Triggered whenever 'messages' array updates or 'isTyping' changes state.
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <main className="flex-1 w-full px-6 py-8 flex flex-col gap-8 overflow-y-auto pb-32 scrollbar-hide">
      <div className="text-center space-y-2 mb-8">
        <p className="text-sm tracking-widest uppercase text-neutral-600 font-medium">Session Initialized</p>
        <p className="text-xs text-neutral-700 font-serif italic">"The Architect of His Own Heart"</p>
      </div>

      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {/* Typing Indicator */}
      {/* Displays while waiting for the Gemini API response. */}
      {isTyping && <TypingIndicator />}

      {/* Invisible div used as the target for the auto-scroll functionality */}
      <div ref={messagesEndRef} />
    </main>
  );
}
