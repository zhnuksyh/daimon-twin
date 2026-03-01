import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Pencil, Eye, Save } from 'lucide-react';

interface WorkbenchProps {
    isOpen: boolean;
    content: string;
    setContent: (content: string) => void;
}

export default function Workbench({ isOpen, content, setContent }: WorkbenchProps) {
    const [mode, setMode] = useState<'edit' | 'preview'>('preview');

    // Downloads the content directly as a local .md file
    const handleSave = () => {
        if (!content.trim()) return;
        
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        // Use a simple title heuristic or timestamp
        const firstLine = content.split('\n')[0].replace(/^#+\s*/, '').trim();
        const filename = firstLine ? `${firstLine.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md` : `draft-${Date.now()}.md`;

        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (!isOpen) return null;

    return (
        <aside className="border-l border-neutral-800 bg-[#0d0d0d] flex flex-col h-full overflow-hidden">
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
                <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-neutral-300 rounded-md transition-colors text-sm font-medium border border-neutral-800 hover:border-neutral-700"
                >
                    <Save size={16} /> Save to Disk
                </button>
            </div>
        </aside>
    );
}
