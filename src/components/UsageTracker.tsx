import { useState, useEffect } from 'react';
import { X, Activity, Cpu, Calendar, Hash, BarChart3, Database } from 'lucide-react';
import { fetchUsageStats, type UsageStats } from '../lib/supabase';

interface UsageTrackerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UsageTracker({ isOpen, onClose }: UsageTrackerProps) {
    const [stats, setStats] = useState<UsageStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            fetchUsageStats().then(data => {
                setStats(data);
                setIsLoading(false);
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-[#0d0d0d] border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-lg font-semibold text-neutral-200">System Telemetry</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-neutral-800 rounded-md text-neutral-500 hover:text-neutral-300 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {isLoading || !stats ? (
                        <div className="text-center py-10 text-neutral-500 text-sm animate-pulse">
                            Gathering telemetry data...
                        </div>
                    ) : (
                        <div className="space-y-6">
                            
                            <p className="text-sm text-neutral-400">
                                Gemini API token consumption tracked across all Daimon Twin subsystems.
                            </p>

                            {/* Main Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-xl p-4 flex flex-col">
                                    <div className="flex items-center gap-2 text-neutral-400 mb-2">
                                        <Hash className="w-4 h-4" />
                                        <span className="text-xs font-medium uppercase tracking-wider">Today</span>
                                    </div>
                                    <span className="text-2xl font-bold text-neutral-200">{stats.todayTokens.toLocaleString()}</span>
                                    <span className="text-xs text-neutral-500 mt-1">tokens consumed</span>
                                </div>

                                <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-xl p-4 flex flex-col">
                                    <div className="flex items-center gap-2 text-neutral-400 mb-2">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-xs font-medium uppercase tracking-wider">This Month</span>
                                    </div>
                                    <span className="text-2xl font-bold text-neutral-200">{stats.monthTokens.toLocaleString()}</span>
                                    <span className="text-xs text-neutral-500 mt-1">tokens consumed</span>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-xl p-4 flex flex-col">
                                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                                    <BarChart3 className="w-4 h-4" />
                                    <span className="text-xs font-medium uppercase tracking-wider">Lifetime Usage</span>
                                </div>
                                <span className="text-3xl font-bold text-indigo-400">{stats.totalTokens.toLocaleString()}</span>
                                <span className="text-xs text-indigo-500/70 mt-1">all-time tokens across all models</span>
                            </div>

                            {/* Breakdown */}
                            {stats.byOperation.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-neutral-300 mb-3 flex items-center gap-2">
                                        <Cpu className="w-4 h-4 text-neutral-500" />
                                        Subsystem Breakdown
                                    </h3>
                                    <div className="space-y-2">
                                        {stats.byOperation.map(op => (
                                            <div key={op.operation_type} className="flex items-center justify-between text-sm px-3 py-2 bg-neutral-900/30 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    {op.operation_type === 'chat' ? (
                                                        <Activity className="w-3.5 h-3.5 text-blue-400" />
                                                    ) : (
                                                        <Database className="w-3.5 h-3.5 text-amber-500" />
                                                    )}
                                                    <span className="text-neutral-300 capitalize">
                                                        {op.operation_type.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-neutral-200 font-medium">{op.tokens.toLocaleString()}</span>
                                                    <span className="text-neutral-500 text-xs ml-2">({op.count} calls)</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
