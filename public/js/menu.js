document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.querySelector('.menu-container');
    const gameContainer = document.getElementById('game-container');
    const buttons = document.querySelectorAll('button');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.id;
            
            switch(action) {
                case 'singleplayer':
                    startGame('singleplayer');
                    break;
                case 'multiplayer':
                    startGame('multiplayer');
                    break;
                case 'custom':
                    showCustomMenu();
                    break;
                case 'store':
                    showStore();
                    break;
                case 'bars':
                    showBars();
                    break;
                case 'settings':
                    showSettings();
                    break;
            }
        });
    });

    function startGame(mode) {
        menuContainer.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        // Inicializar o jogo com o modo selecionado
        initGame(mode);
    }

    function showCustomMenu() {
        // Implementar menu de configurações personalizadas
        alert('Menu personalizado em desenvolvimento!');
    }

    function showStore() {
        // Implementar interface da loja
        alert('Loja em desenvolvimento!');
    }

    function showBars() {
        // Implementar interface de barras/inventário
        alert('Sistema de barras em desenvolvimento!');
    }

    function showSettings() {
        // Implementar menu de configurações
        alert('Configurações em desenvolvimento!');
    }
}); 