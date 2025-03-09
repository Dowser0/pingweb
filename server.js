const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const initializeDatabase = require('./config/init-db');
const authRoutes = require('./routes/auth');
const barsRoutes = require('./routes/bars');
const User = require('./models/User');
const Paddle = require('./models/Paddle');
const UserPaddle = require('./models/UserPaddle');
const { Op } = require('sequelize');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(express.static('public'));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/bars', barsRoutes);

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
    paddleSpeed: 5,
    updateInterval: 1000 / 60, // 60 FPS
    paddleHeight: 100,
    paddleWidth: 10
};

async function getUserPaddle(username) {
    try {
        const user = await User.findOne({
            where: { username },
            include: [{
                model: Paddle,
                through: {
                    where: { isEquipped: true }
                }
            }]
        });

        if (user && user.Paddles.length > 0) {
            return user.Paddles[0];
        }
        return null;
    } catch (error) {
        console.error('Erro ao buscar barra do usuário:', error);
        return null;
    }
}

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
            y: GAME_CONFIG.height / 2 - GAME_CONFIG.paddleHeight / 2,
            score: 0,
            config: {
                speed: 1.0,
                size: 1.0,
                color: '#FFFFFF',
                ability: 'none',
                abilityCooldown: 0,
                abilityDuration: 0
            }
        },
        rightPaddle: {
            y: GAME_CONFIG.height / 2 - GAME_CONFIG.paddleHeight / 2,
            score: 0,
            config: {
                speed: 1.0,
                size: 1.0,
                color: '#FFFFFF',
                ability: 'none',
                abilityCooldown: 0,
                abilityDuration: 0
            }
        }
    };
}

function updateBall(gameState) {
    const ball = gameState.ball;
    const leftPaddle = gameState.leftPaddle;
    const rightPaddle = gameState.rightPaddle;

    // Atualizar posição
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Colisão com as paredes (topo e baixo)
    if (ball.y + ball.radius > GAME_CONFIG.height || ball.y - ball.radius < 0) {
        ball.speedY = -ball.speedY;
        ball.y = ball.y + ball.radius > GAME_CONFIG.height ? 
            GAME_CONFIG.height - ball.radius : ball.radius;
    }

    // Colisão com as raquetes
    if (ball.x - ball.radius < GAME_CONFIG.paddleWidth &&
        ball.y > leftPaddle.y &&
        ball.y < leftPaddle.y + GAME_CONFIG.paddleHeight) {
        ball.speedX = Math.abs(ball.speedX); // Vai para direita
        ball.x = GAME_CONFIG.paddleWidth + ball.radius;
        ball.speedY = (Math.random() * 10 - 5); // Aleatoriedade na direção vertical
    }

    if (ball.x + ball.radius > GAME_CONFIG.width - GAME_CONFIG.paddleWidth &&
        ball.y > rightPaddle.y &&
        ball.y < rightPaddle.y + GAME_CONFIG.paddleHeight) {
        ball.speedX = -Math.abs(ball.speedX); // Vai para esquerda
        ball.x = GAME_CONFIG.width - GAME_CONFIG.paddleWidth - ball.radius;
        ball.speedY = (Math.random() * 10 - 5); // Aleatoriedade na direção vertical
    }

    // Gols
    if (ball.x + ball.radius > GAME_CONFIG.width) {
        leftPaddle.score++;
        resetBall(gameState, 'left');
    } else if (ball.x - ball.radius < 0) {
        rightPaddle.score++;
        resetBall(gameState, 'right');
    }
}

function resetBall(gameState, direction) {
    gameState.ball.x = GAME_CONFIG.width / 2;
    gameState.ball.y = GAME_CONFIG.height / 2;
    gameState.ball.speedX = direction === 'left' ? -GAME_CONFIG.ballSpeed : GAME_CONFIG.ballSpeed;
    gameState.ball.speedY = (Math.random() * 2 - 1) * GAME_CONFIG.ballSpeed;
}

io.on('connection', (socket) => {
    console.log('Um usuário conectou');
    
    socket.on('findMatch', async ({ username }) => {
        try {
            // Buscar usuário e sua barra equipada
            const user = await User.findOne({
                where: { username },
                include: [{
                    model: Paddle,
                    through: {
                        where: { isEquipped: true }
                    }
                }]
            });

            if (!user || !user.Paddles || user.Paddles.length === 0) {
                console.error('Usuário não encontrado ou sem barra equipada');
                return;
            }

            const equippedPaddle = user.Paddles[0];
            const paddleConfig = {
                speed: equippedPaddle.speed,
                size: equippedPaddle.size,
                color: equippedPaddle.color,
                ability: equippedPaddle.ability,
                abilityCooldown: equippedPaddle.abilityCooldown,
                abilityDuration: equippedPaddle.abilityDuration
            };

            // Salvar a configuração da barra no socket do jogador
            socket.paddleConfig = paddleConfig;
            socket.username = username;

            if (waitingPlayers.size > 0) {
                const opponent = Array.from(waitingPlayers)[0];
                waitingPlayers.delete(opponent);

                const gameId = `game_${Date.now()}`;
                socket.join(gameId);
                io.sockets.sockets.get(opponent).join(gameId);

                const gameState = createInitialGameState();
                
                // Configurar barras dos jogadores
                const opponentSocket = io.sockets.sockets.get(opponent);
                if (opponentSocket && opponentSocket.paddleConfig) {
                    gameState.leftPaddle.config = opponentSocket.paddleConfig;
                }

                gameState.rightPaddle.config = paddleConfig;
                
                const gameData = {
                    gameState,
                    players: {
                        left: opponent,
                        right: socket.id
                    },
                    interval: setInterval(() => {
                        updateBall(gameState);
                        io.to(gameId).emit('gameUpdate', gameState);
                    }, GAME_CONFIG.updateInterval)
                };

                activeGames.set(gameId, gameData);

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
                waitingPlayers.add(socket.id);
                socket.emit('waitingForOpponent');
            }
        } catch (error) {
            console.error('Erro ao buscar barra equipada:', error);
        }
    });

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

            io.to(gameId).emit('gameUpdate', gameData.gameState);
        }
    });

    socket.on('abilityUpdate', (data) => {
        const game = Array.from(activeGames.entries()).find(([_, game]) => 
            game.players.left === socket.id || game.players.right === socket.id
        );

        if (game) {
            const [gameId, gameData] = game;
            const isLeftPlayer = gameData.players.left === socket.id;
            
            if (isLeftPlayer) {
                gameData.gameState.leftPaddle.config.size = data.size;
            } else {
                gameData.gameState.rightPaddle.config.size = data.size;
            }

            // Enviar atualização para todos os jogadores na sala
            io.to(gameId).emit('gameUpdate', gameData.gameState);
        }
    });

    socket.on('disconnect', () => {
        console.log('Jogador desconectado:', socket.id);
        
        waitingPlayers.delete(socket.id);

        const game = Array.from(activeGames.entries()).find(([_, game]) => 
            game.players.left === socket.id || game.players.right === socket.id
        );

        if (game) {
            const [gameId, gameData] = game;
            const opponent = gameData.players.left === socket.id ? 
                gameData.players.right : gameData.players.left;

            // Limpar o intervalo de atualização do jogo
            clearInterval(gameData.interval);

            io.to(gameId).emit('opponentDisconnected');
            activeGames.delete(gameId);

            const opponentSocket = io.sockets.sockets.get(opponent);
            if (opponentSocket) {
                opponentSocket.leave(gameId);
            }
        }
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
}); 