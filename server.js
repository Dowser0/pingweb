const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Rotas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Lógica do Socket.IO para multiplayer
io.on('connection', (socket) => {
  console.log('Novo jogador conectado');

  socket.on('joinGame', (gameMode) => {
    // Lógica para juntar jogadores em partidas
  });

  socket.on('gameUpdate', (gameState) => {
    // Lógica para atualizar o estado do jogo
  });

  socket.on('disconnect', () => {
    console.log('Jogador desconectado');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 