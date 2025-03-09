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
            fields: ['UserId', 'PaddleId'],
            name: 'user_paddle_unique'
        }
    ]
});

// Definir as relações
User.belongsToMany(Paddle, { 
    through: UserPaddle
});
Paddle.belongsToMany(User, { 
    through: UserPaddle
});

module.exports = UserPaddle; 