import { io, Socket } from 'socket.io-client';
let socket: Socket | null = null;
export function getSocket(): Socket {
  if (!socket) {
    const token = localStorage.getItem('vk_token');
    socket = io(import.meta.env.VITE_API_URL?.replace('/api','') || '', {
      auth: { token }, transports: ['websocket'],
      reconnection: true, reconnectionDelay: 1000,
    });
    socket.on('connect', () => console.log('[ws] ✅', socket?.id));
    socket.on('disconnect', () => console.log('[ws] disconnected'));
    socket.on('connect_error', e => console.error('[ws] error', e.message));
  }
  return socket;
}
export function disconnectSocket() { socket?.disconnect(); socket = null; }
