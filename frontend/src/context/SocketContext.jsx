import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext({ socket: null });

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      return;
    }

    const token = localStorage.getItem('token');
    const s = io(import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      auth: { token },
    });
    socketRef.current = s;
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user?._id]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
}

export const useSocket = () => useContext(SocketContext);
