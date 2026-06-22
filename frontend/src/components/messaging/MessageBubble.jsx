import { format, isToday, isYesterday } from 'date-fns';

export function DateDivider({ date }) {
  const d = new Date(date);
  let label;
  if (isToday(d)) label = 'Today';
  else if (isYesterday(d)) label = 'Yesterday';
  else label = format(d, 'MMMM d');

  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-border" />
      <span className="font-mono text-[11px] uppercase tracking-wider text-text-disabled">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

export default function MessageBubble({ message, isSent }) {
  const time = format(new Date(message.createdAt), 'h:mm a');

  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className="max-w-[72%]">
        <div
          className={`px-3.5 py-2.5 text-sm leading-relaxed ${
            isSent
              ? 'bg-accent-dim text-accent-text'
              : 'bg-surface-raised text-text-primary'
          }`}
          style={{
            borderRadius: isSent ? '8px 8px 2px 8px' : '8px 8px 8px 2px',
          }}
        >
          {message.content}
        </div>
        <p className={`font-mono text-[10px] text-text-disabled mt-1 ${isSent ? 'text-right' : 'text-left'}`}>
          {time}
        </p>
      </div>
    </div>
  );
}
