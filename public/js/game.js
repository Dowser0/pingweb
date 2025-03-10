class Game {
    constructor(canvas, mode, socket = null, position = null, initialState = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.mode = mode;
        this.socket = socket;
        this.position = position;
        
        // Configurações da bola
        this.baseSpeed = 5; // Velocidade base da bola
        this.speedMultiplier = 1.1; // Multiplicador de velocidade após cada rebatida
        this.maxSpeedMultiplier = 2.5; // Limite máximo do multiplicador de velocidade
        this.currentSpeedMultiplier = 1.0; // Multiplicador atual

        this.ball = initialState ? initialState.ball : {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 10,
            speedX: this.baseSpeed,
            speedY: 5
        };
        
        // Configurações das raquetes
        this.paddleHeight = 100;
        this.paddleWidth = 10;
        this.paddleSpeed = 5;
        
        this.leftPaddle = initialState ? {
            y: initialState.leftPaddle.y,
            score: initialState.leftPaddle.score,
            config: initialState.leftPaddle.config || {
                speed: 1.0,
                size: 1.0,
                color: '#FFFFFF',
                ability: 'none',
                abilityCooldown: 0,
                abilityDuration: 0
            },
            abilityActive: false,
            lastAbilityUse: 0,
            originalSize: 1.0
        } : {
            y: (this.canvas.height - this.paddleHeight) / 2,
            score: 0,
            config: {
                speed: 1.0,
                size: 1.0,
                color: '#FFFFFF',
                ability: 'none',
                abilityCooldown: 0,
                abilityDuration: 0
            },
            abilityActive: false,
            lastAbilityUse: 0,
            originalSize: 1.0
        };
        
        this.rightPaddle = initialState ? {
            y: initialState.rightPaddle.y,
            score: initialState.rightPaddle.score,
            config: initialState.rightPaddle.config || {
                speed: 1.0,
                size: 1.0,
                color: '#FFFFFF',
                ability: 'none',
                abilityCooldown: 0,
                abilityDuration: 0
            },
            abilityActive: false,
            lastAbilityUse: 0,
            originalSize: 1.0
        } : {
            y: (this.canvas.height - this.paddleHeight) / 2,
            score: 0,
            config: {
                speed: 1.0,
                size: 1.0,
                color: '#FFFFFF',
                ability: 'none',
                abilityCooldown: 0,
                abilityDuration: 0
            },
            abilityActive: false,
            lastAbilityUse: 0,
            originalSize: 1.0
        };
        
        // Controles
        this.keys = {
            w: false,
            s: false,
            up: false,
            down: false,
            z: false
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
            if (e.key === 'z' || e.key === 'Z') this.keys.z = true;
        });
        
        window.addEventListener('keyup', (e) => {
            if (e.key === 'w') this.keys.w = false;
            if (e.key === 's') this.keys.s = false;
            if (e.key === 'ArrowUp') this.keys.up = false;
            if (e.key === 'ArrowDown') this.keys.down = false;
            if (e.key === 'z' || e.key === 'Z') this.keys.z = false;
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
            this.draw();
            return;
        }

        this.updatePaddles();
        this.checkAbilities();
        
        if (this.mode !== 'online') {
            this.updateBall();
            this.checkCollisions();
        }
        
        this.draw();
    }
    
    updatePaddles() {
        if (this.mode === 'online') {
            if (this.position === 'left') {
                if (this.keys.w && this.leftPaddle.y > 0) {
                    this.leftPaddle.y -= this.paddleSpeed * this.leftPaddle.config.speed;
                }
                if (this.keys.s && this.leftPaddle.y < this.canvas.height - (this.paddleHeight * this.leftPaddle.config.size)) {
                    this.leftPaddle.y += this.paddleSpeed * this.leftPaddle.config.speed;
                }
                this.socket.emit('paddleMove', { y: this.leftPaddle.y });
            } else if (this.position === 'right') {
                if (this.keys.w && this.rightPaddle.y > 0) {
                    this.rightPaddle.y -= this.paddleSpeed * this.rightPaddle.config.speed;
                }
                if (this.keys.s && this.rightPaddle.y < this.canvas.height - (this.paddleHeight * this.rightPaddle.config.size)) {
                    this.rightPaddle.y += this.paddleSpeed * this.rightPaddle.config.speed;
                }
                this.socket.emit('paddleMove', { y: this.rightPaddle.y });
            }
        } else {
            if (this.keys.w && this.leftPaddle.y > 0) {
                this.leftPaddle.y -= this.paddleSpeed * this.leftPaddle.config.speed;
            }
            if (this.keys.s && this.leftPaddle.y < this.canvas.height - (this.paddleHeight * this.leftPaddle.config.size)) {
                this.leftPaddle.y += this.paddleSpeed * this.leftPaddle.config.speed;
            }
            
            if (this.mode === 'local') {
                if (this.keys.up && this.rightPaddle.y > 0) {
                    this.rightPaddle.y -= this.paddleSpeed * this.rightPaddle.config.speed;
                }
                if (this.keys.down && this.rightPaddle.y < this.canvas.height - (this.paddleHeight * this.rightPaddle.config.size)) {
                    this.rightPaddle.y += this.paddleSpeed * this.rightPaddle.config.speed;
                }
            } else if (this.mode === 'singleplayer') {
                const paddleCenter = this.rightPaddle.y + (this.paddleHeight * this.rightPaddle.config.size) / 2;
                const ballCenter = this.ball.y;
                
                if (paddleCenter < ballCenter - 35) {
                    this.rightPaddle.y += this.paddleSpeed * this.rightPaddle.config.speed;
                } else if (paddleCenter > ballCenter + 35) {
                    this.rightPaddle.y -= this.paddleSpeed * this.rightPaddle.config.speed;
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
        const leftPaddleHeight = this.paddleHeight * this.leftPaddle.config.size;
        const rightPaddleHeight = this.paddleHeight * this.rightPaddle.config.size;

        if (this.ball.x - this.ball.radius < this.paddleWidth &&
            this.ball.y > this.leftPaddle.y &&
            this.ball.y < this.leftPaddle.y + leftPaddleHeight) {
            // Aumentar velocidade após rebatida na raquete esquerda
            this.currentSpeedMultiplier = Math.min(this.currentSpeedMultiplier * this.speedMultiplier, this.maxSpeedMultiplier);
            this.ball.speedX = Math.abs(this.baseSpeed * this.currentSpeedMultiplier);
            this.ball.x = this.paddleWidth + this.ball.radius;
            this.ball.speedY = (Math.random() * 10 - 5) * this.currentSpeedMultiplier;
        }
        
        if (this.ball.x + this.ball.radius > this.canvas.width - this.paddleWidth &&
            this.ball.y > this.rightPaddle.y &&
            this.ball.y < this.rightPaddle.y + rightPaddleHeight) {
            // Aumentar velocidade após rebatida na raquete direita
            this.currentSpeedMultiplier = Math.min(this.currentSpeedMultiplier * this.speedMultiplier, this.maxSpeedMultiplier);
            this.ball.speedX = -Math.abs(this.baseSpeed * this.currentSpeedMultiplier);
            this.ball.x = this.canvas.width - this.paddleWidth - this.ball.radius;
            this.ball.speedY = (Math.random() * 10 - 5) * this.currentSpeedMultiplier;
        }
    }
    
    resetBall(direction) {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        // Resetar velocidade ao valor base quando alguém pontua
        this.currentSpeedMultiplier = 1.0;
        this.ball.speedX = direction === 'left' ? -this.baseSpeed : this.baseSpeed;
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
        
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(this.leftPaddle.score, this.canvas.width / 4, 50);
        this.ctx.fillText(this.rightPaddle.score, 3 * this.canvas.width / 4, 50);
        
        // Desenhar raquete esquerda
        this.ctx.fillStyle = this.leftPaddle.config.color;
        if (this.leftPaddle.abilityActive) {
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#fff';
        }
        this.ctx.fillRect(0, this.leftPaddle.y, 
            this.paddleWidth, 
            this.paddleHeight * this.leftPaddle.config.size);
        this.ctx.shadowBlur = 0;
        
        // Desenhar raquete direita
        this.ctx.fillStyle = this.rightPaddle.config.color;
        if (this.rightPaddle.abilityActive) {
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#fff';
        }
        this.ctx.fillRect(this.canvas.width - this.paddleWidth, 
            this.rightPaddle.y, 
            this.paddleWidth, 
            this.paddleHeight * this.rightPaddle.config.size);
        this.ctx.shadowBlur = 0;
        
        // Desenhar bola
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Desenhar indicador de cooldown da habilidade
        let paddle = this.position === 'left' ? this.leftPaddle : this.rightPaddle;
        if (this.mode !== 'online') {
            paddle = this.leftPaddle;
        }

        if (paddle.config.ability !== 'none') {
            const currentTime = Date.now();
            const cooldownElapsed = currentTime - paddle.lastAbilityUse;
            const cooldownProgress = Math.min(cooldownElapsed / paddle.config.abilityCooldown, 1);

            // Desenhar barra de cooldown
            const barWidth = 50;
            const barHeight = 5;
            const x = this.position === 'left' ? 20 : this.canvas.width - 70;
            const y = 20;

            // Fundo da barra
            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(x, y, barWidth, barHeight);

            // Progresso do cooldown
            this.ctx.fillStyle = cooldownProgress === 1 ? '#00ff00' : '#ff0000';
            this.ctx.fillRect(x, y, barWidth * cooldownProgress, barHeight);

            // Texto da tecla
            this.ctx.font = '12px Arial';
            this.ctx.fillStyle = '#fff';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Z', x + barWidth / 2, y + 20);
        }
    }

    checkAbilities() {
        const currentTime = Date.now();
        let paddle = this.position === 'left' ? this.leftPaddle : this.rightPaddle;
        
        // Se não estamos em modo online, o jogador controla a raquete esquerda
        if (this.mode !== 'online') {
            paddle = this.leftPaddle;
        }

        // Verificar se a habilidade está ativa e se já passou o tempo de duração
        if (paddle.abilityActive && currentTime - paddle.lastAbilityUse >= paddle.config.abilityDuration) {
            this.deactivateAbility(paddle);
        }

        // Verificar se a tecla Z foi pressionada e se a habilidade pode ser usada
        if (this.keys.z && !paddle.abilityActive && paddle.config.ability === 'grow') {
            const cooldownElapsed = currentTime - paddle.lastAbilityUse;
            if (cooldownElapsed >= paddle.config.abilityCooldown) {
                this.activateAbility(paddle);
            }
        }

        // Se estamos em modo online, enviar atualizações da habilidade
        if (this.mode === 'online' && this.socket) {
            this.socket.emit('abilityUpdate', {
                abilityActive: paddle.abilityActive,
                size: paddle.config.size,
                lastAbilityUse: paddle.lastAbilityUse
            });
        }
    }

    activateAbility(paddle) {
        if (paddle.config.ability === 'grow') {
            paddle.originalSize = paddle.config.size;
            paddle.config.size *= 1.5; // Aumenta 50% do tamanho
            paddle.abilityActive = true;
            paddle.lastAbilityUse = Date.now();
            
            // Efeito sonoro ou visual aqui
            console.log('Habilidade ativada!');
        }
    }

    deactivateAbility(paddle) {
        if (paddle.config.ability === 'grow') {
            paddle.config.size = paddle.originalSize;
            paddle.abilityActive = false;
            
            // Efeito sonoro ou visual aqui
            console.log('Habilidade desativada!');
        }
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
        game.ball = gameState.ball;
        
        if (game.position === 'left') {
            game.rightPaddle.y = gameState.rightPaddle.y;
            game.rightPaddle.config.size = gameState.rightPaddle.config.size;
            game.rightPaddle.abilityActive = gameState.rightPaddle.abilityActive;
            game.rightPaddle.lastAbilityUse = gameState.rightPaddle.lastAbilityUse;
        } else {
            game.leftPaddle.y = gameState.leftPaddle.y;
            game.leftPaddle.config.size = gameState.leftPaddle.config.size;
            game.leftPaddle.abilityActive = gameState.leftPaddle.abilityActive;
            game.leftPaddle.lastAbilityUse = gameState.leftPaddle.lastAbilityUse;
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