const sequelize = require('./database');
const User = require('../models/User');
const Paddle = require('../models/Paddle');
const UserPaddle = require('../models/UserPaddle');

const defaultPaddles = [
    {
        name: 'Barra Clássica',
        description: 'A barra tradicional do Pong, equilibrada e confiável.',
        speed: 1.0,
        size: 1.0,
        color: '#FFFFFF',
        isDefault: true
    },
    {
        name: 'Barra Veloz',
        description: 'Uma barra mais rápida, perfeita para jogadores agressivos.',
        speed: 1.3,
        size: 0.8,
        color: '#00FF00',
        isDefault: true
    },
    {
        name: 'Barra Gigante',
        description: 'Uma barra maior, ideal para defesa.',
        speed: 0.8,
        size: 1.5,
        color: '#FF0000',
        isDefault: true
    }
];

const initializeDatabase = async () => {
    try {
        // Forçar recriação das tabelas
        await sequelize.sync({ force: true });

        // Criar barras padrão
        await Paddle.bulkCreate(defaultPaddles);

        console.log('Banco de dados inicializado com sucesso!');

        // Hook para dar barras padrão para novos usuários
        User.afterCreate(async (user) => {
            try {
                const defaultPaddles = await Paddle.findAll({ where: { isDefault: true } });
                
                // Criar array de promessas para criar todas as barras de uma vez
                const createPromises = defaultPaddles.map(paddle => 
                    UserPaddle.create({
                        UserId: user.id,
                        PaddleId: paddle.id,
                        isEquipped: paddle.name === 'Barra Clássica'
                    })
                );

                await Promise.all(createPromises);
            } catch (error) {
                console.error('Erro ao dar barras padrão para novo usuário:', error);
            }
        });

    } catch (error) {
        console.error('Erro ao inicializar banco de dados:', error);
        throw error;
    }
};

module.exports = initializeDatabase; 