"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireJWT = exports.authenticateToken = exports.authenticateSession = exports.authenticateJWT = void 0;
const passport_1 = __importDefault(require("passport"));
const tokens_1 = require("../utils/tokens");
// Middleware для JWT аутентификации через Passport
exports.authenticateJWT = passport_1.default.authenticate('jwt', { session: false });
// Middleware для проверки сессии
const authenticateSession = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Authentication required' });
};
exports.authenticateSession = authenticateSession;
// Комбинированный middleware - проверяет и JWT и сессию
const authenticateToken = (req, res, next) => {
    // Сначала пробуем JWT
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = (0, tokens_1.verifyAccessToken)(token);
        if (decoded) {
            req.user = { id: decoded.id, email: decoded.email };
            next();
            return;
        }
    }
    // Если JWT не сработал, проверяем сессию
    if (req.isAuthenticated()) {
        next();
        return;
    }
    res.status(401).json({ message: 'Authentication required' });
};
exports.authenticateToken = authenticateToken;
// Middleware только для JWT
const requireJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Bearer token required' });
        return;
    }
    const token = authHeader.substring(7);
    const decoded = (0, tokens_1.verifyAccessToken)(token);
    if (!decoded) {
        res.status(401).json({ message: 'Invalid or expired token' });
        return;
    }
    req.user = { id: decoded.id, email: decoded.email };
    next();
};
exports.requireJWT = requireJWT;
