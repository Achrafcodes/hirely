import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as api from '../api';
import ConversationList from '../components/messaging/ConversationList';
import MessageThread from '../components/messaging/MessageThread';

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState(null);
  const [showThread, setShowThread] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    api.getConversations()
      .then((res) => {
        setConversations(res.data);
        // Auto-select conversation from URL param
        const paramId = searchParams.get('conversation');
        if (paramId) {
          const found = res.data.find((c) => c.id === paramId);
          if (found) {
            setActiveConversation(found);
            setShowThread(true);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (conversation) => {
    setActiveConversation(conversation);
    setShowThread(true);
    // Mark as read locally
    setConversations((prev) =>
      prev.map((c) => (c.id === conversation.id ? { ...c, unreadCount: 0 } : c))
    );
  };

  return (
    <div className="animate-fade-in-up">
      <div
        className="flex border border-border rounded-lg overflow-hidden"
        style={{ height: 'calc(100vh - 120px)' }}
      >
        {/* Conversation list — hidden on mobile when thread is open */}
        <div className={`w-full md:w-80 flex-shrink-0 ${showThread ? 'hidden md:flex md:flex-col' : 'flex flex-col'}`}>
          <ConversationList
            conversations={conversations}
            loading={loading}
            activeId={activeConversation?.id}
            onSelect={handleSelect}
          />
        </div>

        {/* Message thread — shown on desktop always, on mobile only when conversation selected */}
        <div className={`flex-1 flex flex-col min-w-0 ${!showThread ? 'hidden md:flex' : 'flex'}`}>
          <MessageThread
            conversation={activeConversation}
            onBack={() => setShowThread(false)}
          />
        </div>
      </div>
    </div>
  );
}
