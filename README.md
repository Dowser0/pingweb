# PingWeb - Jogo de Ping Pong Web

Um jogo de ping pong multiplayer com recursos avançados como:
- Modo Singleplayer
- Modo Multiplayer
- Modo Personalizado
- Sistema de Loja
- Sistema de Barras (Inventário)
- Configurações personalizáveis

## Como executar

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com:
```
MONGODB_URI=sua_url_mongodb
JWT_SECRET=seu_segredo_jwt
PORT=3000
```

3. Execute o servidor:
```bash
npm run dev
```

4. Acesse o jogo em `http://localhost:3000` 