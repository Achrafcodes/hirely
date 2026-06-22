import { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import * as api from '../../api';

export default function UnreadBadge() {
  const [count, setCount] = useState(0);
  const { socket } = useSocket();

  useEffect(() => {
    api.getUnreadCount()
      .then((res) => setCount(res.data.unread))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onNew = () => setCount((c) => c + 1);
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
