"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeRefreshToken = exports.validateRefreshToken = exports.saveRefreshToken = exports.verifyAccessToken = exports.verifyRefreshToken = exports.generateAccessToken = exports.generateTokens = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../middleware/database");
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key';
const generateTokens = (userId, email) => {
    const accessToken = jsonwebtoken_1.default.sign({ id: userId, email, type: 'access' }, JWT_SECRET, { expiresIn: '15m' } // Короткий срок жизни для access token
    );
    const refreshToken = jsonwebtoken_1.default.sign({ id: userId, email, type: 'refresh' }, JWT_REFRESH_SECRET, { expiresIn: '7d' } // Длинный срок жизни для refresh token
    );
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
const generateAccessToken = (userId, email) => {
    return jsonwebtoken_1.default.sign({ id: userId, email, type: 'access' }, JWT_SECRET, { expiresIn: '15m' });
};
exports.generateAccessToken = generateAccessToken;
const verifyRefreshToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
        if (decoded.type !== 'refresh') {
            return null;
        }
        return decoded;
    }
    catch (error) {
        return null;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
const verifyAccessToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (decoded.type !== 'access') {
            return null;
        }
        return decoded;
    }
    catch (error) {
        return null;
    }
};
exports.verifyAccessToken = verifyAccessToken;
const saveRefreshToken = async (userId, refreshToken) => {
    try {
        const db = (0, database_1.getDB)();
        const refreshTokens = db.collection('refresh_tokens');
        // Удаляем старые токены для этого пользователя
        await refreshTokens.deleteMany({ userId });
        // Сохраняем новый токен
        await refreshTokens.insertOne({
            userId,
            token: refreshToken,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 дней
        });
    }
    catch (error) {
        console.error('Error saving refresh token:', error);
        throw error;
    }
};
exports.saveRefreshToken = saveRefreshToken;
const validateRefreshToken = async (refreshToken) => {
    try {
        const db = (0, database_1.getDB)();
        const refreshTokens = db.collection('refresh_tokens');
        const tokenDoc = await refreshTokens.findOne({
            token: refreshToken,
            expiresAt: { $gt: new Date() }
        });
        return !!tokenDoc;
    }
    catch (error) {
        console.error('Error validating refresh token:', error);
        return false;
    }
};
exports.validateRefreshToken = validateRefreshToken;
const removeRefreshToken = async (refreshToken) => {
    try {
        const db = (0, database_1.getDB)();
        const refreshTokens = db.collection('refresh_tokens');
        await refreshTokens.deleteOne({ token: refreshToken });
    }
    catch (error) {
        console.error('Error removing refresh token:', error);
        throw error;
    }
};
exports.removeRefreshToken = removeRefreshToken;
