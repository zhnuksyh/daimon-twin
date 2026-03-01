import { useState } from 'react';
import './App.css';
import { useChat } from './hooks/useChat';
import Header from './components/Header';
import ChatArea from './components/ChatArea';
import MessageInput from './components/MessageInput';
import Workbench from './components/Workbench';

export default function App() {
  const { messages, inputValue, setInputValue, isTyping, handleSend } = useChat();
  const [isWorkbenchOpen, setIsWorkbenchOpen] = useState(false);

  return (
    // MAIN WRAPPER: Uses deep grays (#0a0a0a) for a dark-academia, low-stimulation environment.
    // CSS Grid layout: dynamically toggles between single chat column and dual column.
    <div 
        className={`min-h-screen bg-[#0a0a0a] text-neutral-300 font-sans selection:bg-red-900/40 grid transition-all duration-300 ease-in-out ${
            isWorkbenchOpen ? 'grid-cols-1 lg:grid-cols-[1fr_minmax(400px,1fr)]' : 'grid-cols-1'
        }`}
    >

      {/* === CHAT COLUMN === */}
      <div className="flex flex-col items-center min-h-screen max-w-4xl mx-auto w-full relative">
        <Header 
            isWorkbenchOpen={isWorkbenchOpen} 
            toggleWorkbench={() => setIsWorkbenchOpen(!isWorkbenchOpen)} 
        />
        <ChatArea messages={messages} isTyping={isTyping} />
        <MessageInput
          inputValue={inputValue}
          setInputValue={setInputValue}
          isTyping={isTyping}
          onSend={handleSend}
        />
      </div>

      {/* === WORKBENCH PANEL === */}
      <div className={isWorkbenchOpen ? 'block' : 'hidden lg:hidden'}>
        <Workbench isOpen={isWorkbenchOpen} />
      </div>

    </div>
  );
}
