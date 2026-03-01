import { useState } from 'react';
import './App.css';
import { useChat } from './hooks/useChat';
import Header from './components/Header';
import ChatArea from './components/ChatArea';
import MessageInput from './components/MessageInput';
import Workbench from './components/Workbench';
import Sidebar from './components/Sidebar';
import KnowledgeBase from './components/KnowledgeBase';
import UsageTracker from './components/UsageTracker';

export default function App() {
  const [isWorkbenchOpen, setIsWorkbenchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isKBOpen, setIsKBOpen] = useState(false);
  const [isUsageOpen, setIsUsageOpen] = useState(false);
  const [workbenchContent, setWorkbenchContent] = useState('# The Empty Canvas\n\n...');

  const { messages, inputValue, setInputValue, isTyping, handleSend, loadSession, resetSession, sessionId, sessionUpdatePulse } = useChat({
      setIsWorkbenchOpen,
      setWorkbenchContent,
      workbenchContent
  });

  // Dynamic CSS Grid computation for 1, 2, or 3 columns
  let gridCols = 'grid-cols-1';
  if (isSidebarOpen && isWorkbenchOpen) {
      gridCols += ' lg:grid-cols-[320px_1fr_minmax(400px,1fr)]';
  } else if (isSidebarOpen) {
      gridCols += ' lg:grid-cols-[320px_1fr]';
  } else if (isWorkbenchOpen) {
      gridCols += ' lg:grid-cols-[1fr_minmax(400px,1fr)]';
  }

  return (
    <>
    {/* MAIN WRAPPER: Uses deep grays (#0a0a0a) for a dark-academia, low-stimulation environment. */}
    <div 
        className={`h-screen overflow-hidden bg-[#0a0a0a] text-neutral-300 font-sans selection:bg-red-900/40 grid transition-all duration-300 ease-in-out ${gridCols}`}
    >

      {/* === SIDEBAR (MEMORY VAULT) === */}
      <div className={isSidebarOpen ? 'block min-h-0 h-full overflow-hidden' : 'hidden'}>
          <Sidebar 
              isOpen={isSidebarOpen}
              currentSessionId={sessionId}
              onLoadSession={loadSession}
              onNewSession={resetSession}
              refreshTrigger={sessionUpdatePulse}
          />
      </div>

      {/* === CHAT COLUMN === */}
      <div className={`flex flex-col items-center h-full max-w-4xl mx-auto w-full relative min-h-0 overflow-hidden ${isSidebarOpen || isWorkbenchOpen ? 'hidden lg:flex' : 'flex'}`}>
        <Header 
            isWorkbenchOpen={isWorkbenchOpen} 
            toggleWorkbench={() => {
                setIsWorkbenchOpen(!isWorkbenchOpen);
                if (!isWorkbenchOpen) setIsSidebarOpen(false);
            }} 
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={() => {
                setIsSidebarOpen(!isSidebarOpen);
                if (!isSidebarOpen) setIsWorkbenchOpen(false);
            }}
            onOpenKnowledgeBase={() => setIsKBOpen(true)}
            onOpenUsageTracker={() => setIsUsageOpen(true)}
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
      <div className={isWorkbenchOpen ? 'block min-h-0 h-full overflow-hidden' : 'hidden lg:hidden'}>
        <Workbench 
            isOpen={isWorkbenchOpen} 
            content={workbenchContent}
            setContent={setWorkbenchContent}
        />
      </div>

    </div>

    {/* === KNOWLEDGE BASE MODAL === */}
    <KnowledgeBase isOpen={isKBOpen} onClose={() => setIsKBOpen(false)} />

    {/* === SYSTEM TELEMETRY (USAGE TRACKER) MODAL === */}
    <UsageTracker isOpen={isUsageOpen} onClose={() => setIsUsageOpen(false)} />
    </>
  );
}
