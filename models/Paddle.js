const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Paddle = sequelize.define('Paddle', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    speed: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 1.0
    },
    size: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 1.0
    },
    color: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '#FFFFFF'
    },
    isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

module.exports = Paddle; 