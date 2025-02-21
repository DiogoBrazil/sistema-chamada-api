import http from 'http';
import app from './app';
import { Server as SocketIOServer } from 'socket.io';
import socketHandler from './sockets';
import { container } from './container';
import { TYPES } from './types';
import { InitializeAdminUseCase } from './useCases/professional/InitializeAdminUseCase';

const server = http.createServer(app);

// Rota de teste ao iniciar o servidor
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"]
  }
});

// Inicializa o Socket.IO
socketHandler(io);

// Inicializa o administrador
const initializeAdmin = async () => {
  try {
    const useCase = container.get<InitializeAdminUseCase>(TYPES.InitializeAdminUseCase);
    await useCase.execute();
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
};


const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeAdmin();
});
