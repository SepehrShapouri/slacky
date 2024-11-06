import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'http://localhost:3000';

export const useSocket = (namespace: 'channels' | 'workspaces') => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(`${SOCKET_SERVER_URL}/${namespace}`, {
      auth: {
        token: 'your-session-token' // Replace with actual session token
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log(`Connected to ${namespace} namespace`);
    });

    newSocket.on('reconnect', (attempt) => {
      console.log(`Reconnected to ${namespace} namespace after ${attempt} attempts`);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error(`Reconnection error for ${namespace} namespace:`, error);
    });

    newSocket.on('connect_error', (error) => {
      console.error(`Connection error for ${namespace} namespace:`, error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [namespace]);

  return socket;
};