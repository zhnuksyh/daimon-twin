import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Pencil, Eye, Save } from 'lucide-react';

interface WorkbenchProps {
    isOpen: boolean;
}

export default function Workbench({ isOpen }: WorkbenchProps) {
    const [mode, setMode] = useState<'edit' | 'preview'>('edit');
    const [content, setContent] = useState<string>('# The Empty Canvas\n\nStart drafting your thoughts here...');

    if (!isOpen) return null;

    return (
        <aside className="border-l border-neutral-800 bg-[#0d0d0d] flex flex-col h-screen overflow-hidden">
            {/* Header / Tabs */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 shrink-0">
                <h2 className="text-lg font-medium text-neutral-300">The Workbench</h2>
                
                <div className="flex items-center gap-2">
                    <div className="bg-[#1a1a1a] rounded-md p-1 flex">
                        <button 
                            onClick={() => setMode('edit')}
                            className={`p-1.5 rounded-md transition-colors flex items-center gap-2 text-xs font-medium ${mode === 'edit' ? 'bg-[#2a2a2a] text-neutral-100' : 'text-neutral-500 hover:text-neutral-300'}`}
                        >
                            <Pencil size={14} /> Edit
                        </button>
                        <button 
                            onClick={() => setMode('preview')}
                            className={`p-1.5 rounded-md transition-colors flex items-center gap-2 text-xs font-medium ${mode === 'preview' ? 'bg-[#2a2a2a] text-neutral-100' : 'text-neutral-500 hover:text-neutral-300'}`}
                        >
                            <Eye size={14} /> Preview
                        </button>
                    </div>
                </div>
            </div>

            {/* Editor / Preview Area */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                {mode === 'edit' ? (
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-full min-h-[500px] bg-transparent resize-none outline-none text-neutral-300 font-serif leading-relaxed"
                        placeholder="Begin writing..."
                    />
                ) : (
                    <div className="prose prose-invert prose-neutral max-w-none font-serif">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
            
            {/* Footer / Actions */}
            <div className="p-4 border-t border-neutral-800 shrink-0 flex justify-end">
                <button className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-neutral-300 rounded-md transition-colors text-sm font-medium border border-neutral-800 hover:border-neutral-700">
                    <Save size={16} /> Save to Memory
                </button>
            </div>
        </aside>
    );
}
