"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeServerHeader = exports.securityHeaders = void 0;
const securityHeaders = (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
    next();
};
exports.securityHeaders = securityHeaders;
const removeServerHeader = (req, res, next) => {
    res.removeHeader('X-Powered-By');
    next();
};
exports.removeServerHeader = removeServerHeader;
