import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { verifyAccessToken } from '../utils/tokens';

// Убираем конфликтующее глобальное определение, используем расширение интерфейса
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

// Middleware для JWT аутентификации через Passport
export const authenticateJWT = passport.authenticate('jwt', { session: false });

// Middleware для проверки сессии
export const authenticateSession = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next();
    }
    
    res.status(401).json({ message: 'Authentication required' });
};

// Комбинированный middleware - проверяет и JWT и сессию
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // Сначала пробуем JWT
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = verifyAccessToken(token);
        
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

// Middleware только для JWT
export const requireJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Bearer token required' });
        return;
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
        res.status(401).json({ message: 'Invalid or expired token' });
        return;
    }
    
    req.user = { id: decoded.id, email: decoded.email };
    next();
};
