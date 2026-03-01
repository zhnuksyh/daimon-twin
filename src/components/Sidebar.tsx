import { useEffect, useState } from 'react';
import { fetchSessions, deleteSession, renameSession, type ChatSession } from '../lib/supabase';
import { MessageSquare, PlusCircle, Pencil, Trash2, Check, X } from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    currentSessionId: string;
    onLoadSession: (id: string) => void;
    onNewSession: () => void;
    refreshTrigger: number;
}

export default function Sidebar({ isOpen, currentSessionId, onLoadSession, onNewSession, refreshTrigger }: SidebarProps) {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Rename state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadSessions();
        }
    }, [isOpen, refreshTrigger]);

    const loadSessions = async () => {
        setIsLoading(true);
        const data = await fetchSessions();
        setSessions(data);
        setIsLoading(false);
    };

    const startEditing = (session: ChatSession) => {
        setEditingId(session.session_id);
        setEditTitle(session.title || session.first_message);
    };

    const handleSaveRename = async (sessionId: string) => {
        if (!editTitle.trim()) {
            setEditingId(null);
            return;
        }
        await renameSession(sessionId, editTitle);
        setEditingId(null);
        loadSessions();
    };

    const handleDelete = async (sessionId: string) => {
        if (window.confirm('Are you sure you want to delete this memory?')) {
            await deleteSession(sessionId);
            if (currentSessionId === sessionId) {
                onNewSession();
            }
            loadSessions();
        }
    };

    if (!isOpen) return null;

    return (
        <aside className="border-r border-neutral-800 bg-[#0d0d0d] flex flex-col h-full overflow-hidden w-full lg:w-[320px] shrink-0">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 shrink-0">
                <h2 className="text-lg font-medium text-neutral-300">Memory Vault</h2>
                <button
                    onClick={onNewSession}
                    className="p-1.5 rounded-md hover:bg-[#1a1a1a] text-neutral-400 hover:text-neutral-200 transition-colors"
                    title="New Session"
                >
                    <PlusCircle size={18} />
                </button>
            </div>

            {/* Session List */}
            <div className="flex-1 overflow-y-auto w-full scrollbar-hide p-4 space-y-2">
                {isLoading ? (
                    <div className="text-center py-10 text-neutral-500 text-sm animate-pulse">
                        Retrieving memories...
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="text-center py-10 text-neutral-600 text-sm italic pr-4">
                        The vault is empty.
                    </div>
                ) : (
                    sessions.map(session => (
                        <div
                            key={session.session_id}
                            className={`group w-full text-left px-4 py-3 rounded-lg flex items-start justify-between gap-3 transition-colors ${
                                currentSessionId === session.session_id 
                                    ? 'bg-[#1a1a1a] border border-neutral-700' 
                                    : 'hover:bg-[#151515] border border-transparent'
                            }`}
                        >
                            <div
                                onClick={() => { if (editingId !== session.session_id) onLoadSession(session.session_id); }}
                                className="flex-1 flex items-start gap-3 overflow-hidden text-left cursor-pointer"
                            >
                                <MessageSquare className={`shrink-0 mt-0.5 ${currentSessionId === session.session_id ? 'text-amber-500' : 'text-neutral-600'}`} size={16} />
                                <div className="overflow-hidden w-full">
                                    {editingId === session.session_id ? (
                                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                            <input
                                                type="text"
                                                value={editTitle}
                                                onChange={e => setEditTitle(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') handleSaveRename(session.session_id);
                                                    if (e.key === 'Escape') setEditingId(null);
                                                }}
                                                className="w-full bg-neutral-800 text-neutral-200 px-2 py-1 rounded text-sm outline-none focus:ring-1 focus:ring-amber-500/50"
                                                autoFocus
                                            />
                                            <div role="button" onClick={(e) => { e.stopPropagation(); handleSaveRename(session.session_id); }} className="text-green-500 hover:text-green-400 p-1 cursor-pointer"><Check size={14} /></div>
                                            <div role="button" onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="text-neutral-500 hover:text-neutral-400 p-1 cursor-pointer"><X size={14} /></div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-sm font-medium text-neutral-200 truncate">
                                                {session.title || session.first_message}
                                            </p>
                                            <p className="text-xs text-neutral-500 mt-1">
                                                {new Date(session.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            {/* Action Buttons */}
                            {editingId !== session.session_id && (
                                <div className="flex shrink-0 opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); startEditing(session); }}
                                        className="p-1.5 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 rounded"
                                        title="Rename session"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDelete(session.session_id); }}
                                        className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded"
                                        title="Delete session"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </aside>
    );
}
