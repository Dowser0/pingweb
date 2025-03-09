const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Paddle = sequelize.define('Paddle', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    speed: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    size: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    special_ability: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Paddle; 