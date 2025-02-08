import http from 'http';
import app from './app';
import { Server as SocketIOServer } from 'socket.io';
import socketHandler from './sockets';

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"]
  }
});

// Inicializa o Socket.IO
socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
