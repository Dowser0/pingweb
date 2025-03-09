const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
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
    }
});

module.exports = User; 