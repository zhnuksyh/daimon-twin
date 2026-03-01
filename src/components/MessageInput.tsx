import React, { useState, useRef, useEffect } from 'react';
import { Send, FileEdit } from 'lucide-react';

interface MessageInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  isTyping: boolean;
  onSend: (e: React.FormEvent) => void;
}

export default function MessageInput({ inputValue, setInputValue, isTyping, onSend }: MessageInputProps) {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Parse command from inputValue if it exists to render a pill
  const activeCommandStr = inputValue.startsWith('/draft ') ? '/draft ' : (inputValue === '/draft' ? '/draft' : null);
  const activeCommand = activeCommandStr ? 'draft' : null;
  const displayValue = activeCommandStr ? inputValue.slice(activeCommandStr.length) : inputValue;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (activeCommand) {
        setInputValue(`/draft ${val}`);
    } else {
        setInputValue(val);
        // Show slash menu if they type exactly `/` 
        if (val === '/') {
            setShowSlashMenu(true);
        } else {
            setShowSlashMenu(false);
        }
    }
  };

  const selectCommand = (cmd: string) => {
      setInputValue(`/${cmd} `);
      setShowSlashMenu(false);
      inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Erase the command pill if backspace is pressed on an empty string
    if (e.key === 'Backspace' && displayValue === '' && activeCommand) {
      setInputValue('');
      e.preventDefault();
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // If menu is open and we hit enter, select the first default command (draft)
      if (showSlashMenu) {
          selectCommand('draft');
      } else {
          onSend(e as unknown as React.FormEvent);
      }
    }
  };

  // Click outside to close slash menu
  useEffect(() => {
     const handleClickOutside = () => setShowSlashMenu(false);
     document.addEventListener('click', handleClickOutside);
     return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    // Fixed to the bottom of the screen with a gradient backdrop.
    <footer className="w-full sticky bottom-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-12 pb-6 px-6">
      <form
        onSubmit={onSend}
        onClick={(e) => e.stopPropagation()} // Prevent click-outside from closing menu when interacting with form
        className="relative bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-xl shadow-2xl transition-all focus-within:border-neutral-700 focus-within:ring-1 focus-within:ring-neutral-700 flex items-center pr-14"
      >
        {/* Dropdown Menu */}
        {showSlashMenu && (
            <div className="absolute bottom-[calc(100%+8px)] left-0 w-64 bg-[#111] border border-neutral-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 z-50">
               <div className="px-3 py-2 border-b border-neutral-800/50">
                 <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Commands</span>
               </div>
               <button 
                  type="button"
                  onClick={() => selectCommand('draft')}
                  className="w-full flex items-center gap-3 px-3 py-3 hover:bg-neutral-800/80 transition-colors text-left"
               >
                  <div className="bg-amber-500/10 text-amber-500 p-1.5 rounded-md">
                     <FileEdit size={16} />
                  </div>
                  <div>
                     <p className="text-sm font-medium text-neutral-200">/draft</p>
                     <p className="text-xs text-neutral-500">Ghostwrite to the Workbench</p>
                  </div>
               </button>
            </div>
        )}

        {/* Command Pill */}
        {activeCommand && (
           <div className="pl-5 py-4 flex-shrink-0 flex items-center">
               <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2.5 py-1 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.05)] select-none">
                   <FileEdit size={12} className="opacity-70" />
                   /draft
               </span>
           </div>
        )}

        {/* Dynamic Textarea */}
        <textarea
          ref={inputRef}
          value={displayValue}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={activeCommand ? "Enter topic instruction..." : "What's on your mind today, Daimon?"}
          className={`w-full bg-transparent text-neutral-200 placeholder-neutral-600 py-4 resize-none focus:outline-none min-h-[56px] max-h-[200px] ${activeCommand ? 'pl-2' : 'pl-5'}`}
          rows={1}
          style={{
            height: 'auto',
            fieldSizing: 'content' as unknown as undefined
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
    </footer>
  );
}
