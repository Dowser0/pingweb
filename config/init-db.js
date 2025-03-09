const sequelize = require('./database');
const User = require('../models/User');
const Paddle = require('../models/Paddle');
const UserPaddle = require('../models/UserPaddle');

const initializeDatabase = async () => {
    try {
        await sequelize.sync({ force: true });
        
        // Criar paddles iniciais
        const defaultPaddles = [
            {
                name: 'Paddle Básico',
                price: 0,
                speed: 1.0,
                size: 1.0,
                special_ability: null
            },
            {
                name: 'Paddle Veloz',
                price: 1000,
                speed: 1.5,
                size: 0.8,
                special_ability: 'Velocidade aumentada'
            },
            {
                name: 'Paddle Grande',
                price: 1500,
                speed: 0.8,
                size: 1.5,
                special_ability: 'Tamanho aumentado'
            }
        ];

        await Paddle.bulkCreate(defaultPaddles);
        console.log('Banco de dados inicializado com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar banco de dados:', error);
    }
};

module.exports = initializeDatabase; 