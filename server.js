const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Habilitar CORS para todas as rotas
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Rotas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Status check para o Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Lógica do Socket.IO para multiplayer
io.on('connection', (socket) => {
  console.log('Novo jogador conectado');

  socket.on('joinGame', (gameMode) => {
    // Lógica para juntar jogadores em partidas
    console.log(`Jogador entrou no modo: ${gameMode}`);
  });

  socket.on('gameUpdate', (gameState) => {
    // Lógica para atualizar o estado do jogo
    socket.broadcast.emit('gameUpdate', gameState);
  });

  socket.on('disconnect', () => {
    console.log('Jogador desconectado');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 