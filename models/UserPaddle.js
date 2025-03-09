const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Paddle = require('./Paddle');

const UserPaddle = sequelize.define('UserPaddle', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
});

User.belongsToMany(Paddle, { through: UserPaddle });
Paddle.belongsToMany(User, { through: UserPaddle });

module.exports = UserPaddle; 