class Game {
    constructor(mode) {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.mode = mode;
        
        // Configuração do canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Configuração do jogo
        this.paddleHeight = 100;
        this.paddleWidth = 20;
        this.ballSize = 15;
        this.paddleSpeed = 5;
        this.ballSpeed = 5;
        
        // Posições iniciais
        this.resetPositions();
        
        // Controles
        this.keys = {};
        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
        
        // Iniciar loop do jogo
        this.gameLoop();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    resetPositions() {
        // Posição das raquetes
        this.leftPaddle = {
            x: 50,
            y: this.canvas.height / 2 - this.paddleHeight / 2
        };
        
        this.rightPaddle = {
            x: this.canvas.width - 50 - this.paddleWidth,
            y: this.canvas.height / 2 - this.paddleHeight / 2
        };
        
        // Posição da bola
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            dx: this.ballSpeed * (Math.random() > 0.5 ? 1 : -1),
            dy: this.ballSpeed * (Math.random() > 0.5 ? 1 : -1)
        };
    }

    update() {
        // Movimento das raquetes
        if (this.keys['w'] && this.leftPaddle.y > 0) {
            this.leftPaddle.y -= this.paddleSpeed;
        }
        if (this.keys['s'] && this.leftPaddle.y < this.canvas.height - this.paddleHeight) {
            this.leftPaddle.y += this.paddleSpeed;
        }
        
        if (this.mode === 'singleplayer') {
            // IA para o modo singleplayer
            if (this.ball.y < this.rightPaddle.y + this.paddleHeight / 2) {
                this.rightPaddle.y -= this.paddleSpeed;
            } else {
                this.rightPaddle.y += this.paddleSpeed;
            }
        } else {
            // Controles para o segundo jogador
            if (this.keys['ArrowUp'] && this.rightPaddle.y > 0) {
                this.rightPaddle.y -= this.paddleSpeed;
            }
            if (this.keys['ArrowDown'] && this.rightPaddle.y < this.canvas.height - this.paddleHeight) {
                this.rightPaddle.y += this.paddleSpeed;
            }
        }
        
        // Movimento da bola
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        // Colisões com as paredes
        if (this.ball.y <= 0 || this.ball.y >= this.canvas.height) {
            this.ball.dy *= -1;
        }
        
        // Colisões com as raquetes
        if (this.checkCollision(this.ball, this.leftPaddle) || 
            this.checkCollision(this.ball, this.rightPaddle)) {
            this.ball.dx *= -1;
        }
        
        // Pontuação
        if (this.ball.x <= 0) {
            this.resetPositions();
            // Adicionar pontuação para o jogador da direita
        }
        if (this.ball.x >= this.canvas.width) {
            this.resetPositions();
            // Adicionar pontuação para o jogador da esquerda
        }
    }

    checkCollision(ball, paddle) {
        return ball.x < paddle.x + this.paddleWidth &&
               ball.x + this.ballSize > paddle.x &&
               ball.y < paddle.y + this.paddleHeight &&
               ball.y + this.ballSize > paddle.y;
    }

    draw() {
        // Limpar canvas
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Desenhar raquetes
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(this.leftPaddle.x, this.leftPaddle.y, 
                         this.paddleWidth, this.paddleHeight);
        this.ctx.fillRect(this.rightPaddle.x, this.rightPaddle.y, 
                         this.paddleWidth, this.paddleHeight);
        
        // Desenhar bola
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ballSize / 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

function initGame(mode) {
    new Game(mode);
} 