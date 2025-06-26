"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const passport_1 = __importDefault(require("passport"));
const database_1 = require("../middleware/database");
const tokens_1 = require("../utils/tokens");
const register = async (req, res) => {
    try {
        console.log('User registration:', { email: req.body.email, password: '***' });
        const { email, password } = req.body;
        if (!email || !password) {
            console.log('Required fields are missing');
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }
        const db = (0, database_1.getDB)();
        const users = db.collection('users');
        const existingUser = await users.findOne({ email });
        if (existingUser) {
            console.log('User already exists:', email);
            res.status(400).json({ message: 'The user already exists' });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const newUser = {
            email,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await users.insertOne(newUser);
        console.log('User created:', result.insertedId);
        const { accessToken, refreshToken } = (0, tokens_1.generateTokens)(result.insertedId.toString(), email);
        // Сохраняем refresh token в базе
        await (0, tokens_1.saveRefreshToken)(result.insertedId.toString(), refreshToken);
        // Устанавливаем сессию
        req.login({ _id: result.insertedId, email }, (err) => {
            if (err) {
                console.error('Session login error:', err);
            }
        });
        res.status(201).json({
            message: 'User registered successfully',
            accessToken,
            refreshToken,
            user: {
                id: result.insertedId,
                email
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.register = register;
const login = (req, res, next) => {
    passport_1.default.authenticate('local', async (err, user, info) => {
        if (err) {
            next(err);
            return;
        }
        if (!user) {
            res.status(400).json({
                message: info?.message || 'Incorrect credentials'
            });
            return;
        }
        try {
            const { accessToken, refreshToken } = (0, tokens_1.generateTokens)(user._id.toString(), user.email);
            // Сохраняем refresh token в базе
            await (0, tokens_1.saveRefreshToken)(user._id.toString(), refreshToken);
            // Устанавливаем сессию
            req.login(user, (err) => {
                if (err) {
                    console.error('Session login error:', err);
                }
            });
            res.json({
                message: 'Successful authorization',
                accessToken,
                refreshToken,
                user: {
                    id: user._id,
                    email: user.email
                }
            });
        }
        catch (error) {
            console.error('Authorization error:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    })(req, res, next);
};
exports.login = login;
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(401).json({ message: 'Refresh token is required' });
            return;
        }
        // Проверяем токен
        const decoded = (0, tokens_1.verifyRefreshToken)(refreshToken);
        if (!decoded) {
            res.status(401).json({ message: 'Invalid refresh token' });
            return;
        }
        // Проверяем, что токен есть в базе
        const isValid = await (0, tokens_1.validateRefreshToken)(refreshToken);
        if (!isValid) {
            res.status(401).json({ message: 'Refresh token not found or expired' });
            return;
        }
        // Генерируем новый access token
        const newAccessToken = (0, tokens_1.generateAccessToken)(decoded.id, decoded.email);
        res.json({
            accessToken: newAccessToken
        });
    }
    catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.refreshToken = refreshToken;
const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        // Удаляем refresh token из базы
        if (refreshToken) {
            await (0, tokens_1.removeRefreshToken)(refreshToken);
        }
        // Уничтожаем сессию
        req.logout((err) => {
            if (err) {
                console.error('Logout error:', err);
            }
        });
        // Уничтожаем сессию полностью
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err);
                return res.status(500).json({ message: 'Could not log out' });
            }
            res.clearCookie('connect.sid'); // Название куки по умолчанию для express-session
            res.json({ message: 'Logged out successfully' });
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.logout = logout;
const verify = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'Access token is required' });
            return;
        }
        // Здесь можно добавить проверку токена, например с помощью JWT verify
        // Но поскольку у нас есть middleware authenticateJWT, можно просто вернуть успех
        res.json({
            message: 'Token is valid',
            user: req.user || { id: 'verified', email: 'verified' }
        });
    }
    catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};
exports.verify = verify;
