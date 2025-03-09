const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Paddle = require('../models/Paddle');
const UserPaddle = require('../models/UserPaddle');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Rota temporária para adicionar barras padrão a um usuário
router.get('/add-default-paddles', async (req, res) => {
    try {
        const username = req.query.username;
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Buscar barras padrão
        const defaultPaddles = await Paddle.findAll({ where: { isDefault: true } });
        
        // Verificar quais barras o usuário já tem
        const userPaddles = await UserPaddle.findAll({
            where: { UserId: user.id }
        });

        // Adicionar barras que faltam
        for (const paddle of defaultPaddles) {
            const hasPaddle = userPaddles.some(up => up.PaddleId === paddle.id);
            if (!hasPaddle) {
                await UserPaddle.create({
                    UserId: user.id,
                    PaddleId: paddle.id,
                    isEquipped: paddle.name === 'Barra Clássica'
                });
            }
        }

        // Garantir que pelo menos uma barra está equipada
        const hasEquippedPaddle = await UserPaddle.findOne({
            where: { UserId: user.id, isEquipped: true }
        });

        if (!hasEquippedPaddle) {
            const firstPaddle = await UserPaddle.findOne({
                where: { UserId: user.id }
            });
            if (firstPaddle) {
                firstPaddle.isEquipped = true;
                await firstPaddle.save();
            }
        }

        res.json({ message: 'Barras padrão adicionadas com sucesso' });
    } catch (error) {
        console.error('Erro ao adicionar barras padrão:', error);
        res.status(500).json({ error: 'Erro ao adicionar barras padrão' });
    }
});

// Rota para obter o inventário de barras do usuário
router.get('/inventory', async (req, res) => {
    try {
        const username = req.query.username;
        const user = await User.findOne({ 
            where: { username },
            include: [{
                model: Paddle,
                through: { attributes: ['isEquipped'] }
            }]
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const paddles = user.Paddles.map(paddle => ({
            id: paddle.id,
            name: paddle.name,
            description: paddle.description,
            speed: paddle.speed,
            size: paddle.size,
            color: paddle.color,
            isEquipped: paddle.UserPaddle.isEquipped
        }));

        res.json({ paddles });
    } catch (error) {
        console.error('Erro ao buscar inventário:', error);
        res.status(500).json({ error: 'Erro ao buscar inventário' });
    }
});

// Rota para equipar uma barra
router.post('/equip', async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { username, paddleId } = req.body;
        const user = await User.findOne({ 
            where: { username },
            transaction: t
        });

        if (!user) {
            await t.rollback();
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Verificar se o usuário possui a barra
        const userPaddle = await UserPaddle.findOne({
            where: {
                UserId: user.id,
                PaddleId: paddleId
            },
            transaction: t
        });

        if (!userPaddle) {
            await t.rollback();
            return res.status(400).json({ error: 'Você não possui esta barra' });
        }

        // Desequipar a barra atual
        await UserPaddle.update(
            { isEquipped: false },
            { 
                where: { 
                    UserId: user.id,
                    isEquipped: true
                },
                transaction: t
            }
        );

        // Equipar a nova barra
        await UserPaddle.update(
            { isEquipped: true },
            { 
                where: { 
                    UserId: user.id,
                    PaddleId: paddleId
                },
                transaction: t
            }
        );

        await t.commit();
        res.json({ message: 'Barra equipada com sucesso' });
    } catch (error) {
        await t.rollback();
        console.error('Erro ao equipar barra:', error);
        res.status(500).json({ error: 'Erro ao equipar barra' });
    }
});

module.exports = router; 