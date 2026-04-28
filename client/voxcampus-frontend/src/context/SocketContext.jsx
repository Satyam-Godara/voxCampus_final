// import { createContext, useContext, useEffect, useRef, useState } from 'react';
// import { io } from 'socket.io-client';

// const SocketContext = createContext(null);

// export const SocketProvider = ({ children, token }) => {
//   const socketRef = useRef(null);
//   const [connected, setConnected] = useState(false);

//   useEffect(() => {
//     if (!token) return;

//     const socket = io('/', { auth: { token }, transports: ['websocket'] });
//     socketRef.current = socket;

//     socket.on('connect',    () => setConnected(true));
//     socket.on('disconnect', () => setConnected(false));

//     return () => { socket.disconnect(); socketRef.current = null; };
//   }, [token]);

//   return (
//     <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export const useSocket = () => useContext(SocketContext);
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children, token }) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const socket = io('/', { auth: { token }, transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect',    () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);