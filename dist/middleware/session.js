"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionMiddleware = void 0;
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const SESSION_SECRET = process.env.SESSION_SECRET || 'session-secret-key';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/finance-spa';
exports.sessionMiddleware = (0, express_session_1.default)({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: connect_mongo_1.default.create({
        mongoUrl: MONGO_URI,
        collectionName: 'sessions',
        ttl: 24 * 60 * 60 // 24 hours in seconds
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS в продакшене
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    }
});
