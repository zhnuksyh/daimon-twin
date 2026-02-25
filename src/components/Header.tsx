import { Hexagon, BookOpen, Terminal } from 'lucide-react';

export default function Header() {
  return (
    // Sticky header containing branding and future feature toggles.
    <header className="w-full border-b border-neutral-800/60 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-10 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <Hexagon className="w-6 h-6 text-neutral-500" />
        <h1 className="text-xl font-medium tracking-wide text-neutral-200">
          Daimon<span className="text-neutral-600">.sys</span>
        </h1>
      </div>
      <div className="flex gap-4 text-neutral-500">
        {/* Future toggle to view raw vector embeddings / memory core */}
        <button className="hover:text-neutral-300 transition-colors" title="Memory Core">
          <BookOpen className="w-5 h-5" />
        </button>
        {/* Future toggle to switch between "Engineer Mode" and "Philosopher Mode" */}
        <button className="hover:text-neutral-300 transition-colors" title="System Logs">
          <Terminal className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
