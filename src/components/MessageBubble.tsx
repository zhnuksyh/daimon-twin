import { User, Hexagon } from 'lucide-react';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-4 max-w-[85%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        {isUser ? (
          <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center border border-neutral-700">
            <User className="w-4 h-4 text-neutral-400" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center border border-neutral-700 shadow-sm">
            <Hexagon className="w-4 h-4 text-amber-700/80" />
          </div>
        )}
      </div>

      {/* Message Bubble */}
      <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 text-xs text-neutral-500 px-1">
          <span className="font-medium">{isUser ? 'You' : 'Daimon Twin'}</span>
          <span>•</span>
          <span>{message.timestamp}</span>
        </div>
        <div
          className={`px-5 py-4 rounded-xl text-[15px] leading-relaxed shadow-sm
            ${isUser
              ? 'bg-neutral-800/80 text-neutral-200 rounded-tr-sm border border-neutral-700/50'
              : 'bg-transparent text-neutral-300 border border-neutral-800 rounded-tl-sm font-serif'
            }`}
        >
          {message.text}
        </div>
      </div>
    </div>
  );
}
