import { Server } from 'socket.io';

let ioInstance: Server;

export default function socketHandler(io: Server) {
  ioInstance = io;
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

export function getIO() {
  if (!ioInstance) {
    throw new Error("Socket.IO não foi inicializado");
  }
  return ioInstance;
}
