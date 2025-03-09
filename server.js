const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const initializeDatabase = require('./config/init-db');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(express.static('public'));

// Inicializar banco de dados
initializeDatabase();

// Gerenciamento de jogadores e salas
const waitingPlayers = new Set();
const activeGames = new Map();

// Configurações do jogo
const GAME_CONFIG = {
    width: 800,
    height: 600,
    ballSpeed: 5,
    paddleSpeed: 5
};

function createInitialGameState() {
    return {
        ball: {
            x: GAME_CONFIG.width / 2,
            y: GAME_CONFIG.height / 2,
            speedX: GAME_CONFIG.ballSpeed,
            speedY: (Math.random() * 2 - 1) * GAME_CONFIG.ballSpeed,
            radius: 10
        },
        leftPaddle: {
            y: GAME_CONFIG.height / 2 - 50,
            score: 0
        },
        rightPaddle: {
            y: GAME_CONFIG.height / 2 - 50,
            score: 0
        }
    };
}

io.on('connection', (socket) => {
    console.log('Novo jogador conectado:', socket.id);

    // Quando um jogador procura uma partida
    socket.on('findMatch', () => {
        console.log('Jogador procurando partida:', socket.id);

        if (waitingPlayers.size > 0) {
            // Encontrou um oponente
            const opponent = Array.from(waitingPlayers)[0];
            waitingPlayers.delete(opponent);

            // Criar nova sala
            const gameId = `game_${Date.now()}`;
            socket.join(gameId);
            io.sockets.sockets.get(opponent).join(gameId);

            // Configurar estado inicial do jogo
            const gameState = createInitialGameState();

            activeGames.set(gameId, {
                gameState,
                players: {
                    left: opponent,
                    right: socket.id
                },
                lastUpdate: Date.now()
            });

            // Notificar os jogadores com suas posições
            io.to(opponent).emit('matchFound', {
                gameId,
                position: 'left',
                initialState: gameState
            });

            io.to(socket.id).emit('matchFound', {
                gameId,
                position: 'right',
                initialState: gameState
            });

        } else {
            // Adicionar à fila de espera
            waitingPlayers.add(socket.id);
            socket.emit('waitingForOpponent');
        }
    });

    // Quando um jogador move a raquete
    socket.on('paddleMove', (data) => {
        const game = Array.from(activeGames.entries()).find(([_, game]) => 
            game.players.left === socket.id || game.players.right === socket.id
        );

        if (game) {
            const [gameId, gameData] = game;
            const isLeftPlayer = gameData.players.left === socket.id;
            
            if (isLeftPlayer) {
                gameData.gameState.leftPaddle.y = data.y;
            } else {
                gameData.gameState.rightPaddle.y = data.y;
            }

            // Emitir atualização para todos na sala
            io.to(gameId).emit('gameUpdate', gameData.gameState);
        }
    });

    // Atualização da bola
    socket.on('ballUpdate', (data) => {
        const game = Array.from(activeGames.entries()).find(([_, game]) => 
            game.players.left === socket.id
        );

        if (game) {
            const [gameId, gameData] = game;
            gameData.gameState.ball = data.ball;
            gameData.gameState.leftPaddle.score = data.leftScore;
            gameData.gameState.rightPaddle.score = data.rightScore;

            io.to(gameId).emit('gameUpdate', gameData.gameState);
        }
    });

    // Quando um jogador desconecta
    socket.on('disconnect', () => {
        console.log('Jogador desconectado:', socket.id);
        
        // Remover da fila de espera
        waitingPlayers.delete(socket.id);

        // Encerrar jogo ativo
        const game = Array.from(activeGames.entries()).find(([_, game]) => 
            game.players.left === socket.id || game.players.right === socket.id
        );

        if (game) {
            const [gameId, gameData] = game;
            const opponent = gameData.players.left === socket.id ? 
                gameData.players.right : gameData.players.left;

            io.to(gameId).emit('opponentDisconnected');
            activeGames.delete(gameId);

            // Notificar o oponente
            const opponentSocket = io.sockets.sockets.get(opponent);
            if (opponentSocket) {
                opponentSocket.leave(gameId);
            }
        }
    });
});

// Rotas básicas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
}); 