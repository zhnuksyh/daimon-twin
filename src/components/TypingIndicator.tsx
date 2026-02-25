import { Hexagon, Loader2 } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="flex gap-4 max-w-[85%] self-start">
      <div className="flex-shrink-0 mt-1">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center border border-neutral-700">
          <Hexagon className="w-4 h-4 text-amber-700/80" />
        </div>
      </div>
      <div className="flex flex-col items-start gap-1">
        <div className="px-5 py-4 rounded-xl bg-transparent border border-neutral-800 rounded-tl-sm flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-neutral-500 animate-spin" />
          <span className="text-sm text-neutral-500 font-serif italic">Accessing memory core...</span>
        </div>
      </div>
    </div>
  );
}
