import { useEffect, useRef, useState } from 'react';
import { isSameDay } from 'date-fns';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api';
import MessageBubble, { DateDivider } from './MessageBubble';
import MessageInput from './MessageInput';

function ThreadSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
      {[false, true, false, true].map((right, i) => (
        <div key={i} className={`flex ${right ? 'justify-end' : 'justify-start'}`}>
          <div className="h-10 bg-surface-raised rounded animate-pulse" style={{ width: `${40 + (i * 15) % 30}%` }} />
        </div>
      ))}
    </div>
  );
}

export default function MessageThread({ conversation, onBack }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const conversationId = conversation?.id;

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  useEffect(() => {
    if (!conversationId) return;
    setLoading(true);
    api.getMessages(conversationId)
      .then((res) => {
        setMessages(res.data);
        requestAnimationFrame(scrollToBottom);
      })
      .finally(() => setLoading(false));
  }, [conversationId]);

  useEffect(() => {
    if (!socket || !conversationId) return;
    socket.emit('join_conversation', conversationId);
    const handler = (msg) => {
      setMessages((prev) => prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]);
      const el = scrollRef.current;
      if (el) {
        const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        if (nearBottom) el.scrollTop = el.scrollHeight;
      }
    };
    socket.on('new_message', handler);
    return () => {
      socket.off('new_message', handler);
      socket.emit('leave_conversation', conversationId);
    };
  }, [socket, conversationId]);

  const handleSend = async (content) => {
    setSending(true);
    try {
      const res = await api.sendMessage({ conversationId, content });
      if (!socket) {
        const history = await api.getMessages(conversationId);
        setMessages(history.data);
      } else {
        setMessages((prev) => [...prev, res.data.message]);
      }
      requestAnimationFrame(scrollToBottom);
    } finally {
      setSending(false);
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <i className="ti ti-message-2 text-4xl text-text-disabled mb-3" />
        <p className="text-sm font-medium text-text-secondary">Select a conversation</p>
        <p className="text-sm text-text-disabled mt-1">Choose from the list on the left to start reading.</p>
      </div>
    );
  }

  // Group messages by date for dividers
  const grouped = [];
  messages.forEach((msg, i) => {
    const prev = messages[i - 1];
    if (!prev || !isSameDay(new Date(prev.createdAt), new Date(msg.createdAt))) {
      grouped.push({ type: 'divider', date: msg.createdAt, key: `d-${msg._id}` });
    }
    grouped.push({ type: 'message', msg, key: msg._id });
  });

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          {/* Mobile back button */}
          <button onClick={onBack} className="md:hidden text-text-secondary hover:text-accent transition-colors mr-1">
            <i className="ti ti-arrow-left text-lg" />
          </button>
          <div>
            <p className="text-sm font-medium text-text-primary">{conversation.participant?.name}</p>
            {conversation.job && (
              <p className="font-mono text-[11px] uppercase tracking-wide text-text-secondary">
                {conversation.job.title}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      {loading ? (
        <ThreadSkeleton />
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
          {grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-sm text-text-disabled">No messages yet. Say hello!</p>
            </div>
          ) : (
            grouped.map((item) =>
              item.type === 'divider' ? (
                <DateDivider key={item.key} date={item.date} />
              ) : (
                <MessageBubble
                  key={item.key}
                  message={item.msg}
                  isSent={item.msg.sender?._id === user?._id || item.msg.sender === user?._id}
                />
              )
            )
          )}
        </div>
      )}

      <MessageInput onSend={handleSend} disabled={sending} />
    </div>
  );
}
