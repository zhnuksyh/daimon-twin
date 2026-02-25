import './App.css';
import { useChat } from './hooks/useChat';
import Header from './components/Header';
import ChatArea from './components/ChatArea';
import MessageInput from './components/MessageInput';

export default function App() {
  const { messages, inputValue, setInputValue, isTyping, handleSend } = useChat();

  return (
    // MAIN WRAPPER: Uses deep grays (#0a0a0a) for a dark-academia, low-stimulation environment.
    // CSS Grid layout: single column by default, ready for a Workbench panel on the right.
    // To enable: change grid-cols-1 to grid-cols-[1fr_minmax(400px,1fr)] and unhide the workbench.
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-300 font-sans selection:bg-red-900/40 grid grid-cols-1">

      {/* === CHAT COLUMN === */}
      <div className="flex flex-col items-center min-h-screen max-w-4xl mx-auto w-full">
        <Header />
        <ChatArea messages={messages} isTyping={isTyping} />
        <MessageInput
          inputValue={inputValue}
          setInputValue={setInputValue}
          isTyping={isTyping}
          onSend={handleSend}
        />
      </div>

      {/* === WORKBENCH PANEL (Future) ===
        To activate "The Workbench":
        1. Change the parent grid class to: grid-cols-[1fr_minmax(400px,1fr)]
        2. Uncomment the <aside> panel below.
        3. The Workbench will be a markdown editor for drafting long-form content.
      */}
      {/*
      <aside className="border-l border-neutral-800 bg-[#0d0d0d] p-6 overflow-y-auto min-h-screen">
        <h2 className="text-lg font-medium text-neutral-300 mb-4">The Workbench</h2>
        // Markdown editor component goes here
      </aside>
      */}

    </div>
  );
}
