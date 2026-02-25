import React from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  isTyping: boolean;
  onSend: (e: React.FormEvent) => void;
}

export default function MessageInput({ inputValue, setInputValue, isTyping, onSend }: MessageInputProps) {
  return (
    // Fixed to the bottom of the screen with a gradient backdrop.
    <footer className="w-full sticky bottom-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-12 pb-6 px-6">
      <form
        onSubmit={onSend}
        className="relative bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-xl shadow-2xl transition-all focus-within:border-neutral-700 focus-within:ring-1 focus-within:ring-neutral-700"
      >
        {/* Dynamic Textarea: Uses fieldSizing to auto-expand vertically as the user types long prompts. */}
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend(e);
            }
          }}
          placeholder="What's on your mind today, Daimon?"
          className="w-full bg-transparent text-neutral-200 placeholder-neutral-600 px-5 py-4 pr-14 resize-none focus:outline-none min-h-[56px] max-h-[200px]"
          rows={1}
          style={{
            height: 'auto',
            fieldSizing: 'content' as unknown as undefined // Modern CSS for auto-expanding textareas
          }}
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isTyping}
          className="absolute right-3 bottom-3 p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
      <div className="text-center mt-3">
        <p className="text-[10px] text-neutral-600 tracking-wider uppercase">
          Powered by Gemini API & Supabase pgvector
        </p>
      </div>
    </footer>
  );
}
