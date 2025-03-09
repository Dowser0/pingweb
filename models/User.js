const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    coins: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    selectedPaddle: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    experience: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    wins: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    losses: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    highScore: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    totalGames: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lastLogin: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

module.exports = User; 