document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.querySelector('.menu-container');
    const gameContainer = document.getElementById('game-container');
    const canvas = document.getElementById('gameCanvas');
    const gameMessage = document.getElementById('game-message');
    
    // Configuração do canvas
    canvas.width = 800;
    canvas.height = 600;
    
    // Handlers dos botões
    document.getElementById('singleplayer').addEventListener('click', () => {
        startGame('singleplayer');
    });

    document.getElementById('multiplayer-local').addEventListener('click', () => {
        startGame('local');
    });

    document.getElementById('multiplayer-online').addEventListener('click', () => {
        startOnlineGame();
    });

    document.getElementById('custom').addEventListener('click', () => {
        startGame('custom');
    });

    document.getElementById('store').addEventListener('click', () => {
        showStore();
    });

    document.getElementById('bars').addEventListener('click', () => {
        showBars();
    });

    document.getElementById('settings').addEventListener('click', () => {
        showSettings();
    });

    function showMessage(message) {
        gameMessage.textContent = message;
        gameMessage.classList.remove('hidden');
    }

    function hideMessage() {
        gameMessage.classList.add('hidden');
    }

    function startGame(mode) {
        menuContainer.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        hideMessage();
        initializeGame(mode);
    }

    function startOnlineGame() {
        menuContainer.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        
        try {
            const socket = io();
            showMessage('Conectando ao servidor...');

            socket.on('connect', () => {
                showMessage('Procurando oponente...');
                socket.emit('findMatch');
            });
            
            socket.on('waitingForOpponent', () => {
                showMessage('Aguardando oponente...');
            });
            
            socket.on('matchFound', (matchData) => {
                showMessage('Partida encontrada! Iniciando...');
                
                setTimeout(() => {
                    hideMessage();
                    initializeOnlineGame(socket, matchData);
                }, 1500);
            });
            
            socket.on('disconnect', () => {
                showMessage('Desconectado do servidor. Tentando reconectar...');
            });
            
            socket.on('connect_error', () => {
                showMessage('Erro ao conectar ao servidor.\nVoltando ao menu em 3 segundos...');
                
                setTimeout(() => {
                    menuContainer.classList.remove('hidden');
                    gameContainer.classList.add('hidden');
                    hideMessage();
                }, 3000);
            });
        } catch (error) {
            showMessage('Erro ao iniciar o jogo online.\nVerifique sua conexão com a internet.');
            
            setTimeout(() => {
                menuContainer.classList.remove('hidden');
                gameContainer.classList.add('hidden');
                hideMessage();
            }, 3000);
        }
    }

    function showStore() {
        // Implementar lógica da loja
        console.log('Abrindo loja...');
    }

    function showBars() {
        // Implementar lógica do inventário de barras
        console.log('Abrindo inventário de barras...');
    }

    function showSettings() {
        // Implementar lógica das configurações
        console.log('Abrindo configurações...');
    }
}); 