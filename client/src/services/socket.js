import { io } from 'socket.io-client';

let socket = null;

export const getSocket = (userId) => {
  if (socket?.connected) return socket;
  const url = import.meta.env.VITE_API_URL || window.location.origin;
  socket = io(url, {
    path: '/socket.io',
    auth: { userId },
  });
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
