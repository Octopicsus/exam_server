import { Request, Response, NextFunction } from 'express';

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
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

export const validateRegistration = (req: Request, res: Response, next: NextFunction): void => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        res.status(400).json({ 
            message: 'Email and password are required' 
        });
        return;
    }
    
    if (!validateEmail(email)) {
        res.status(400).json({ 
            message: 'Invalid email format' 
        });
        return;
    }
    
    const passwordValidation = validatePassword(password);
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

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        res.status(400).json({ 
            message: 'Email and password are required' 
        });
        return;
    }
    
    if (!validateEmail(email)) {
        res.status(400).json({ 
            message: 'Invalid email format' 
        });
        return;
    }
    
    next();
};

const attemptMap = new Map<string, { count: number; lastAttempt: number }>();

export const rateLimitAuth = (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; 
    const maxAttempts = 5;
    
    const attempts = attemptMap.get(ip);
    
    if (attempts) {
      
        if (now - attempts.lastAttempt > windowMs) {
            attemptMap.delete(ip);
        } else if (attempts.count >= maxAttempts) {
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
