const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Paddle = require('./Paddle');

const UserPaddle = sequelize.define('UserPaddle', {
    // Não precisamos definir userId e paddleId aqui, pois o belongsToMany já fará isso
}, {
    timestamps: true
});

// Definir as relações
User.belongsToMany(Paddle, { through: UserPaddle });
Paddle.belongsToMany(User, { through: UserPaddle });

module.exports = UserPaddle; 