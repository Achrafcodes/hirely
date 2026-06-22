import { formatDistanceToNowStrict } from 'date-fns';

export default function ConversationItem({ conversation, active, onClick }) {
  const { participant, job, lastMessage, unreadCount, updatedAt } = conversation;

  const initials = participant?.name
    ? participant.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const timeAgo = updatedAt
    ? formatDistanceToNowStrict(new Date(updatedAt), { addSuffix: false })
    : '';

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors duration-150 border-l-2 ${
        active
          ? 'bg-surface-raised border-accent'
          : 'border-transparent hover:bg-surface-raised'
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-9 h-9 rounded-sm bg-surface border border-border flex items-center justify-center font-mono text-caption text-text-secondary uppercase">
        {initials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-text-primary truncate">{participant?.name}</span>
          <span className="font-mono text-[11px] text-text-secondary flex-shrink-0">{timeAgo}</span>
        </div>
        {job && (
          <p className="font-mono text-[11px] uppercase tracking-wide text-text-secondary truncate mt-0.5">
            {job.title}
          </p>
        )}
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-sm text-text-secondary truncate leading-snug">
            {lastMessage?.content || 'No messages yet'}
          </p>
          {unreadCount > 0 && (
            <span className="flex-shrink-0 w-[18px] h-[18px] rounded-full bg-accent text-base text-[11px] font-medium flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
