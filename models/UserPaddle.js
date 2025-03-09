const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Paddle = require('./Paddle');

const UserPaddle = sequelize.define('UserPaddle', {
    isEquipped: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['UserId', 'PaddleId']
        }
    ]
});

// Definir as relações com chave primária composta
User.belongsToMany(Paddle, { 
    through: UserPaddle,
    uniqueKey: 'UserPaddle_unique'
});
Paddle.belongsToMany(User, { 
    through: UserPaddle,
    uniqueKey: 'UserPaddle_unique'
});

module.exports = UserPaddle; 