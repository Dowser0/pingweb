const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Paddle = sequelize.define('Paddle', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
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
        defaultValue: '#FFFFFF'
    },
    special_ability: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Paddle; 