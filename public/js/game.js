class Game {
    constructor(canvas, mode, socket = null, position = null, initialState = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.mode = mode;
        this.socket = socket;
        this.position = position;
        
        // Configurações da bola
        this.ball = initialState ? initialState.ball : {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 10,
            speedX: 5,
            speedY: 5
        };
        
        // Configurações das raquetes
        this.paddleHeight = 100;
        this.paddleWidth = 10;
        this.paddleSpeed = 5;
        
        this.leftPaddle = initialState ? initialState.leftPaddle : {
            y: (this.canvas.height - this.paddleHeight) / 2,
            score: 0
        };
        
        this.rightPaddle = initialState ? initialState.rightPaddle : {
            y: (this.canvas.height - this.paddleHeight) / 2,
            score: 0
        };
        
        // Controles
        this.keys = {
            w: false,
            s: false,
            up: false,
            down: false
        };
        
        this.setupControls();

        // Status do jogo
        this.gameStatus = {
            waiting: false,
            message: '',
            started: false
        };

        // Elemento de mensagem
        this.messageElement = document.getElementById('game-message');
    }
    
    setupControls() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'w') this.keys.w = true;
            if (e.key === 's') this.keys.s = true;
            if (e.key === 'ArrowUp') this.keys.up = true;
            if (e.key === 'ArrowDown') this.keys.down = true;
        });
        
        window.addEventListener('keyup', (e) => {
            if (e.key === 'w') this.keys.w = false;
            if (e.key === 's') this.keys.s = false;
            if (e.key === 'ArrowUp') this.keys.up = false;
            if (e.key === 'ArrowDown') this.keys.down = false;
        });
    }
    
    showMessage(message) {
        if (this.messageElement) {
            this.messageElement.textContent = message;
            this.messageElement.classList.remove('hidden');
        }
    }

    hideMessage() {
        if (this.messageElement) {
            this.messageElement.classList.add('hidden');
        }
    }
    
    update() {
        if (this.mode === 'online' && !this.gameStatus.started) {
            this.draw(); // Mantém o canvas limpo
            return;
        }

        this.updatePaddles();
        
        if (this.mode !== 'online' || this.position === 'left') {
            this.updateBall();
            this.checkCollisions();
            
            if (this.mode === 'online') {
                this.socket.emit('ballUpdate', {
                    ball: this.ball,
                    leftScore: this.leftPaddle.score,
                    rightScore: this.rightPaddle.score
                });
            }
        }
        
        this.draw();
    }
    
    updatePaddles() {
        if (this.mode === 'online') {
            if (this.position === 'left') {
                if (this.keys.w && this.leftPaddle.y > 0) {
                    this.leftPaddle.y -= this.paddleSpeed;
                }
                if (this.keys.s && this.leftPaddle.y < this.canvas.height - this.paddleHeight) {
                    this.leftPaddle.y += this.paddleSpeed;
                }
                this.socket.emit('paddleMove', { y: this.leftPaddle.y });
            } else if (this.position === 'right') {
                if (this.keys.w && this.rightPaddle.y > 0) {
                    this.rightPaddle.y -= this.paddleSpeed;
                }
                if (this.keys.s && this.rightPaddle.y < this.canvas.height - this.paddleHeight) {
                    this.rightPaddle.y += this.paddleSpeed;
                }
                this.socket.emit('paddleMove', { y: this.rightPaddle.y });
            }
        } else {
            if (this.keys.w && this.leftPaddle.y > 0) {
                this.leftPaddle.y -= this.paddleSpeed;
            }
            if (this.keys.s && this.leftPaddle.y < this.canvas.height - this.paddleHeight) {
                this.leftPaddle.y += this.paddleSpeed;
            }
            
            if (this.mode === 'local') {
                if (this.keys.up && this.rightPaddle.y > 0) {
                    this.rightPaddle.y -= this.paddleSpeed;
                }
                if (this.keys.down && this.rightPaddle.y < this.canvas.height - this.paddleHeight) {
                    this.rightPaddle.y += this.paddleSpeed;
                }
            } else if (this.mode === 'singleplayer') {
                const paddleCenter = this.rightPaddle.y + this.paddleHeight / 2;
                const ballCenter = this.ball.y;
                
                if (paddleCenter < ballCenter - 35) {
                    this.rightPaddle.y += this.paddleSpeed;
                } else if (paddleCenter > ballCenter + 35) {
                    this.rightPaddle.y -= this.paddleSpeed;
                }
            }
        }
    }
    
    updateBall() {
        this.ball.x += this.ball.speedX;
        this.ball.y += this.ball.speedY;
        
        if (this.ball.y + this.ball.radius > this.canvas.height || 
            this.ball.y - this.ball.radius < 0) {
            this.ball.speedY = -this.ball.speedY;
        }
        
        if (this.ball.x + this.ball.radius > this.canvas.width) {
            this.leftPaddle.score++;
            this.resetBall('left');
        } else if (this.ball.x - this.ball.radius < 0) {
            this.rightPaddle.score++;
            this.resetBall('right');
        }
    }
    
    checkCollisions() {
        if (this.ball.x - this.ball.radius < this.paddleWidth &&
            this.ball.y > this.leftPaddle.y &&
            this.ball.y < this.leftPaddle.y + this.paddleHeight) {
            this.ball.speedX = Math.abs(this.ball.speedX); // Garante que vai para a direita
            this.ball.x = this.paddleWidth + this.ball.radius;
            // Adiciona um pouco de aleatoriedade na direção vertical
            this.ball.speedY = (Math.random() * 10 - 5);
        }
        
        if (this.ball.x + this.ball.radius > this.canvas.width - this.paddleWidth &&
            this.ball.y > this.rightPaddle.y &&
            this.ball.y < this.rightPaddle.y + this.paddleHeight) {
            this.ball.speedX = -Math.abs(this.ball.speedX); // Garante que vai para a esquerda
            this.ball.x = this.canvas.width - this.paddleWidth - this.ball.radius;
            // Adiciona um pouco de aleatoriedade na direção vertical
            this.ball.speedY = (Math.random() * 10 - 5);
        }
    }
    
    resetBall(direction) {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        // Define a direção inicial baseada em quem marcou o ponto
        this.ball.speedX = direction === 'left' ? -5 : 5;
        this.ball.speedY = (Math.random() * 10 - 5);
    }
    
    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.strokeStyle = '#fff';
        this.ctx.setLineDash([5, 15]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.leftPaddle.score, this.canvas.width / 4, 50);
        this.ctx.fillText(this.rightPaddle.score, 3 * this.canvas.width / 4, 50);
        
        this.ctx.fillRect(0, this.leftPaddle.y, this.paddleWidth, this.paddleHeight);
        this.ctx.fillRect(this.canvas.width - this.paddleWidth, this.rightPaddle.y, 
                         this.paddleWidth, this.paddleHeight);
        
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
}

function initializeGame(mode) {
    const canvas = document.getElementById('gameCanvas');
    const game = new Game(canvas, mode);
    game.gameStatus.started = true;
    
    function gameLoop() {
        game.update();
        requestAnimationFrame(gameLoop);
    }
    
    gameLoop();
}

function initializeOnlineGame(socket, matchData) {
    const canvas = document.getElementById('gameCanvas');
    const game = new Game(canvas, 'online', socket, matchData.position, matchData.initialState);
    
    game.gameStatus.started = true;
    game.hideMessage();
    
    socket.on('gameUpdate', (gameState) => {
        if (game.position === 'right') {
            game.ball = gameState.ball;
        }
        
        if (game.position === 'left') {
            game.rightPaddle.y = gameState.rightPaddle.y;
        } else {
            game.leftPaddle.y = gameState.leftPaddle.y;
        }
        
        game.leftPaddle.score = gameState.leftPaddle.score;
        game.rightPaddle.score = gameState.rightPaddle.score;
    });
    
    socket.on('opponentDisconnected', () => {
        game.gameStatus.started = false;
        game.showMessage('Oponente desconectou. Voltando ao menu...');
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    });
    
    function gameLoop() {
        game.update();
        requestAnimationFrame(gameLoop);
    }
    
    gameLoop();
} 