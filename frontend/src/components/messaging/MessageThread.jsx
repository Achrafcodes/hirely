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

  const playNotif = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.18);
    } catch {}
  };

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  useEffect(() => {
    if (!conversationId) return;
    setMessages([]);
    setLoading(true);
    api.getMessages(conversationId)
      .then((res) => setMessages(res.data))
      .finally(() => setLoading(false));
  }, [conversationId]);

  // Scroll after messages render (loading just turned false and messages painted)
  useEffect(() => {
    if (!loading && messages.length > 0) {
      requestAnimationFrame(scrollToBottom);
    }
  }, [loading]);

  useEffect(() => {
    if (!socket || !conversationId) return;

    const join = () => socket.emit('join_conversation', conversationId);
    join();

    const handler = (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        playNotif();
        return [...prev, msg];
      });
      requestAnimationFrame(() => {
        const el = scrollRef.current;
        if (!el) return;
        const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
        if (nearBottom) el.scrollTop = el.scrollHeight;
      });
    };

    socket.on('new_message', handler);

    const readHandler = ({ conversationId: cid }) => {
      if (cid !== conversationId) return;
      setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
    };
    socket.on('messages_read', readHandler);

    // Re-join room after a socket reconnect (room membership is lost on disconnect)
    socket.on('connect', join);

    return () => {
      socket.off('new_message', handler);
      socket.off('messages_read', readHandler);
      socket.off('connect', join);
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

  // Sort ascending so out-of-order socket arrivals don't scramble the view
  const sorted = [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // Group messages by date for dividers
  const grouped = [];
  sorted.forEach((msg, i) => {
    const prev = sorted[i - 1];
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
        <div ref={scrollRef} className="messages-scroll flex-1 overflow-y-auto px-5 py-4">
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
                  read={item.msg.read}
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
