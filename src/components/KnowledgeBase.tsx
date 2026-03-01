import { useState, useEffect, useCallback } from 'react';
import { X, Upload, FileText, Trash2, Database, CloudUpload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { fetchIngestedFiles, deleteIngestedFile, processAndEmbedFile, type IngestedFile, type IngestProgress } from '../lib/ingestClient';

interface KnowledgeBaseProps {
    isOpen: boolean;
    onClose: () => void;
}

type Tab = 'view' | 'upload';

export default function KnowledgeBase({ isOpen, onClose }: KnowledgeBaseProps) {
    const [tab, setTab] = useState<Tab>('view');
    const [files, setFiles] = useState<IngestedFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Upload state
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<IngestProgress | null>(null);
    const [uploadQueue, setUploadQueue] = useState<File[]>([]);

    const loadFiles = useCallback(async () => {
        setIsLoading(true);
        const data = await fetchIngestedFiles();
        setFiles(data);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (isOpen) loadFiles();
    }, [isOpen, loadFiles]);

    // ============================================
    // DRAG AND DROP HANDLERS
    // ============================================
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.md'));
        if (droppedFiles.length > 0) {
            setUploadQueue(droppedFiles);
            processFiles(droppedFiles);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []).filter(f => f.name.endsWith('.md'));
        if (selectedFiles.length > 0) {
            setUploadQueue(selectedFiles);
            processFiles(selectedFiles);
        }
    };

    const processFiles = async (filesToProcess: File[]) => {
        for (const file of filesToProcess) {
            await processAndEmbedFile(file, (progress) => {
                setUploadProgress(progress);
            });
        }
        // After all files are processed, refresh the file list & switch to view tab
        await loadFiles();
        setUploadQueue([]);
        setTimeout(() => {
            setTab('view');
            setUploadProgress(null);
        }, 2000);
    };

    const handleDeleteFile = async (sourceFile: string) => {
        if (window.confirm(`Remove "${sourceFile}" from the knowledge base?`)) {
            await deleteIngestedFile(sourceFile);
            loadFiles();
        }
    };

    if (!isOpen) return null;

    const totalChunks = files.reduce((sum, f) => sum + f.chunk_count, 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-[#0d0d0d] border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <Database className="w-5 h-5 text-amber-500" />
                        <h2 className="text-lg font-semibold text-neutral-200">Knowledge Base</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-neutral-800 rounded-md text-neutral-500 hover:text-neutral-300 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-neutral-800 shrink-0">
                    <button
                        onClick={() => setTab('view')}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                            tab === 'view'
                                ? 'text-amber-500 border-b-2 border-amber-500'
                                : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <FileText size={14} />
                            Ingested ({files.length} files, {totalChunks} chunks)
                        </span>
                    </button>
                    <button
                        onClick={() => setTab('upload')}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                            tab === 'upload'
                                ? 'text-amber-500 border-b-2 border-amber-500'
                                : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <Upload size={14} />
                            Upload
                        </span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto scrollbar-hide p-6">
                    {tab === 'view' ? (
                        /* ========== VIEW TAB ========== */
                        isLoading ? (
                            <div className="text-center py-16 text-neutral-500 animate-pulse text-sm">
                                Loading knowledge base...
                            </div>
                        ) : files.length === 0 ? (
                            <div className="text-center py-16 text-neutral-600">
                                <Database className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                <p className="text-sm italic">No files ingested yet.</p>
                                <p className="text-xs mt-2 text-neutral-700">
                                    Drag and drop Markdown files in the Upload tab.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {files.map(file => (
                                    <div
                                        key={file.source_file}
                                        className="group flex items-center justify-between px-4 py-3 bg-neutral-900/50 border border-neutral-800/50 rounded-lg hover:border-neutral-700 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <FileText className="w-4 h-4 text-amber-500/70 shrink-0" />
                                            <div className="overflow-hidden">
                                                <p className="text-sm text-neutral-200 truncate font-medium">{file.title}</p>
                                                <p className="text-xs text-neutral-500">{file.source_file} &middot; {file.chunk_count} chunks</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteFile(file.source_file)}
                                            className="p-1.5 text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-neutral-800 rounded"
                                            title="Remove from knowledge base"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        /* ========== UPLOAD TAB ========== */
                        <div className="space-y-6">
                            {/* Dropzone */}
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
                                    isDragOver
                                        ? 'border-amber-500 bg-amber-500/5'
                                        : 'border-neutral-700 hover:border-neutral-600 bg-neutral-900/30'
                                }`}
                                onClick={() => document.getElementById('kb-file-input')?.click()}
                            >
                                <CloudUpload className={`w-10 h-10 mx-auto mb-4 ${isDragOver ? 'text-amber-500' : 'text-neutral-600'}`} />
                                <p className="text-sm text-neutral-300 font-medium">
                                    {isDragOver ? 'Drop your Markdown files here' : 'Drag & drop Markdown files'}
                                </p>
                                <p className="text-xs text-neutral-500 mt-2">
                                    or click to browse &middot; Only .md files supported
                                </p>
                                <input
                                    id="kb-file-input"
                                    type="file"
                                    accept=".md"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                            </div>

                            {/* Progress */}
                            {uploadProgress && (
                                <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        {uploadProgress.phase === 'done' ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                        ) : uploadProgress.phase === 'error' ? (
                                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                        ) : (
                                            <Loader2 className="w-5 h-5 text-amber-500 animate-spin shrink-0" />
                                        )}
                                        <p className="text-sm text-neutral-300">{uploadProgress.message}</p>
                                    </div>

                                    {uploadProgress.total > 0 && uploadProgress.phase === 'embedding' && (
                                        <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                                                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Queue */}
                            {uploadQueue.length > 0 && !uploadProgress && (
                                <div className="space-y-2">
                                    {uploadQueue.map(file => (
                                        <div key={file.name} className="flex items-center gap-3 px-4 py-2 bg-neutral-900/50 rounded-lg text-sm text-neutral-400">
                                            <FileText size={14} />
                                            {file.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
