"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    if (err.name === 'ValidationError') {
        res.status(400).json({
            message: 'Validation error',
            details: err.message
        });
        return;
    }
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
        res.status(500).json({
            message: 'Database error'
        });
        return;
    }
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({
            message: 'Invalid token'
        });
        return;
    }
    if (err.name === 'TokenExpiredError') {
        res.status(401).json({
            message: 'Token expired'
        });
        return;
    }
    res.status(500).json({
        message: 'Internal server error'
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    res.status(404).json({
        message: `Route ${req.originalUrl} not found`
    });
};
exports.notFoundHandler = notFoundHandler;
