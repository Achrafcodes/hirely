import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import * as api from '../../api';

const playNotif = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const t = ctx.currentTime;

    const ping = (freq, vol, startAt, dur) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, startAt);
      gain.gain.linearRampToValueAtTime(vol, startAt + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + dur);
      osc.start(startAt);
      osc.stop(startAt + dur);
    };

    // Messenger-style: two quick soft pings, main tone + quiet harmonic for warmth
    ping(1396, 0.13, t, 0.22);        // F6 — main ping
    ping(2093, 0.04, t, 0.18);        // C7 — harmonic, adds warmth
    ping(1047, 0.10, t + 0.11, 0.20); // C6 — follow-up note
  } catch {}
};

export default function UnreadBadge() {
  const [count, setCount] = useState(0);
  const { socket } = useSocket();
  const location = useLocation();

  useEffect(() => {
    api.getUnreadCount()
      .then((res) => setCount(res.data.unread))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onNew = () => {
      setCount((c) => c + 1);
      // Only play sound when not already on the messages page
      if (!location.pathname.startsWith('/messages')) playNotif();
    };
    const onRead = () => {
      // Re-fetch the accurate total after marking read
      api.getUnreadCount().then((res) => setCount(res.data.unread)).catch(() => {});
    };
    socket.on('new_message', onNew);
    socket.on('messages_read', onRead);
    return () => {
      socket.off('new_message', onNew);
      socket.off('messages_read', onRead);
    };
  }, [socket]);

  if (count === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-accent text-base text-[10px] font-medium flex items-center justify-center">
      {count > 9 ? '9+' : count}
    </span>
  );
}
