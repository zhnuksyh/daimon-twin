import { Hexagon, BookOpen, Terminal, PanelRight, PanelRightClose, PanelLeft, PanelLeftClose } from 'lucide-react';

interface HeaderProps {
    isWorkbenchOpen: boolean;
    toggleWorkbench: () => void;
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    onOpenKnowledgeBase: () => void;
}

export default function Header({ isWorkbenchOpen, toggleWorkbench, isSidebarOpen, toggleSidebar, onOpenKnowledgeBase }: HeaderProps) {
  return (
    // Sticky header containing branding and future feature toggles.
    <header className="w-full border-b border-neutral-800/60 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-10 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleSidebar}
          className={`transition-colors lg:hidden ${isSidebarOpen ? 'text-neutral-300' : 'hover:text-neutral-300 text-neutral-500'}`} 
          title="Toggle Memory Vault"
        >
          {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
        </button>
        <button 
          onClick={toggleSidebar}
          className={`hidden lg:block transition-colors ${isSidebarOpen ? 'text-neutral-300' : 'hover:text-neutral-300 text-neutral-500'}`} 
          title="Toggle Memory Vault"
        >
          {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
        </button>
        
        <Hexagon className="w-6 h-6 text-neutral-500 hidden sm:block ml-2" />
        <h1 className="text-xl font-medium tracking-wide text-neutral-200">
          Daimon<span className="text-neutral-600">.sys</span>
        </h1>
      </div>
      <div className="flex gap-4 text-neutral-500">
        <button onClick={onOpenKnowledgeBase} className="hover:text-neutral-300 transition-colors" title="Knowledge Base">
          <BookOpen className="w-5 h-5" />
        </button>
        <button className="hover:text-neutral-300 transition-colors" title="System Logs">
          <Terminal className="w-5 h-5" />
        </button>
        <button 
          onClick={toggleWorkbench}
          className={`transition-colors ${isWorkbenchOpen ? 'text-neutral-300' : 'hover:text-neutral-300'}`} 
          title="Toggle Workbench"
        >
          {isWorkbenchOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRight className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
