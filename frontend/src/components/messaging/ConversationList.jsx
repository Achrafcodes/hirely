import { useState } from 'react';
import ConversationItem from './ConversationItem';

function ConversationSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="w-9 h-9 rounded-sm bg-surface-raised animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-surface-raised rounded animate-pulse w-2/3" />
        <div className="h-3 bg-surface-raised rounded animate-pulse w-full" />
      </div>
    </div>
  );
}

export default function ConversationList({ conversations, loading, activeId, onSelect }) {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.participant?.name?.toLowerCase().includes(q) ||
      c.job?.title?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-full border-r border-border">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-border">
        <h2 className="text-h2 font-medium text-text-primary mb-3">Messages</h2>
        <input
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-surface-inset border border-border text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <ConversationSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-6">
            <i className="ti ti-message text-3xl text-text-disabled mb-2" />
            <p className="text-sm font-medium text-text-secondary">No messages yet</p>
            <p className="text-sm text-text-disabled mt-1">
              Start a conversation from any job listing or applicant profile.
            </p>
          </div>
        ) : (
          filtered.map((c) => (
            <ConversationItem
              key={c.id}
              conversation={c}
              active={c.id === activeId}
              onClick={() => onSelect(c)}
            />
          ))
        )}
      </div>
    </div>
  );
}
