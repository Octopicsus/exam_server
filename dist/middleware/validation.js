"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitAuth = exports.validateLogin = exports.validateRegistration = exports.validatePassword = exports.validateEmail = void 0;
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const validatePassword = (password) => {
    if (!password) {
        return { isValid: false, message: 'Password is required' };
    }
    if (password.length < 4) {
        return { isValid: false, message: 'Password must be at least 4 characters long' };
    }
    if (password.length > 255) {
        return { isValid: false, message: 'Password must be less than 255 characters' };
    }
    return { isValid: true };
};
exports.validatePassword = validatePassword;
const validateRegistration = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({
            message: 'Email and password are required'
        });
        return;
    }
    if (!(0, exports.validateEmail)(email)) {
        res.status(400).json({
            message: 'Invalid email format'
        });
        return;
    }
    const passwordValidation = (0, exports.validatePassword)(password);
    if (!passwordValidation.isValid) {
        res.status(400).json({
            message: passwordValidation.message
        });
        return;
    }
    if (email.length > 255) {
        res.status(400).json({
            message: 'Email must be less than 255 characters'
        });
        return;
    }
    next();
};
exports.validateRegistration = validateRegistration;
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({
            message: 'Email and password are required'
        });
        return;
    }
    if (!(0, exports.validateEmail)(email)) {
        res.status(400).json({
            message: 'Invalid email format'
        });
        return;
    }
    next();
};
exports.validateLogin = validateLogin;
const attemptMap = new Map();
const rateLimitAuth = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    const maxAttempts = 5;
    const attempts = attemptMap.get(ip);
    if (attempts) {
        if (now - attempts.lastAttempt > windowMs) {
            attemptMap.delete(ip);
        }
        else if (attempts.count >= maxAttempts) {
            res.status(429).json({
                message: 'Too many authentication attempts. Please try again later.'
            });
            return;
        }
    }
    const currentAttempts = attempts ? attempts.count + 1 : 1;
    attemptMap.set(ip, { count: currentAttempts, lastAttempt: now });
    next();
};
exports.rateLimitAuth = rateLimitAuth;
