const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { Op } = require('sequelize');

// Rota de registro
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Verificar se usuário já existe
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { username: username },
                    { email: email }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({
                error: 'Usuário ou email já cadastrado'
            });
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Criar novo usuário
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        // Remover senha do objeto de resposta
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.status(201).json({
            message: 'Usuário criado com sucesso',
            user: userResponse
        });
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({
            error: 'Erro ao criar usuário'
        });
    }
});

// Rota de login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Buscar usuário
        const user = await User.findOne({
            where: { username }
        });

        if (!user) {
            return res.status(401).json({
                error: 'Usuário não encontrado'
            });
        }

        // Verificar senha
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                error: 'Senha incorreta'
            });
        }

        // Atualizar último login
        user.lastLogin = new Date();
        await user.save();

        // Remover senha do objeto de resposta
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.json({
            message: 'Login realizado com sucesso',
            user: userResponse
        });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({
            error: 'Erro ao fazer login'
        });
    }
});

module.exports = router; 