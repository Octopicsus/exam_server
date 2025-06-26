import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
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

export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({
        message: `Route ${req.originalUrl} not found`
    });
};
