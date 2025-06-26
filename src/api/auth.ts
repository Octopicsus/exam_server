import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { getDB } from '../middleware/database';
import { 
    generateTokens, 
    generateAccessToken, 
    verifyRefreshToken, 
    saveRefreshToken, 
    validateRefreshToken, 
    removeRefreshToken 
} from '../utils/tokens';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('User registration:', { email: req.body.email, password: '***' });
        const { email, password } = req.body;
        
        if (!email || !password) {
            console.log('Required fields are missing');
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }
        
        const db = getDB();
        const users = db.collection('users');
        
        const existingUser = await users.findOne({ email });
        if (existingUser) {
            console.log('User already exists:', email);
            res.status(400).json({ message: 'The user already exists' });
            return;
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = {
            email,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const result = await users.insertOne(newUser);
        console.log('User created:', result.insertedId);
        
        const { accessToken, refreshToken } = generateTokens(
            result.insertedId.toString(), 
            email
        );
        
        // Сохраняем refresh token в базе
        await saveRefreshToken(result.insertedId.toString(), refreshToken);
        
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
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const login = (req: Request, res: Response, next: NextFunction): void => {
    passport.authenticate('local', async (err: any, user: any, info: any) => {
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
            const { accessToken, refreshToken } = generateTokens(
                user._id.toString(), 
                user.email
            );
            
            // Сохраняем refresh token в базе
            await saveRefreshToken(user._id.toString(), refreshToken);
            
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
        } catch (error) {
            console.error('Authorization error:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    })(req, res, next);
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            res.status(401).json({ message: 'Refresh token is required' });
            return;
        }
        
        // Проверяем токен
        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) {
            res.status(401).json({ message: 'Invalid refresh token' });
            return;
        }
        
        // Проверяем, что токен есть в базе
        const isValid = await validateRefreshToken(refreshToken);
        if (!isValid) {
            res.status(401).json({ message: 'Refresh token not found or expired' });
            return;
        }
        
        // Генерируем новый access token
        const newAccessToken = generateAccessToken(decoded.id, decoded.email);
        
        res.json({
            accessToken: newAccessToken
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;
        
        // Удаляем refresh token из базы
        if (refreshToken) {
            await removeRefreshToken(refreshToken);
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
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const verify = async (req: Request, res: Response): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            res.status(401).json({ message: 'Access token is required' });
            return;
        }
        
        // req.user устанавливается middleware authenticateJWT через passport-jwt
        if (req.user) {
            res.json({ 
                message: 'Token is valid',
                user: {
                    id: (req.user as any)._id || (req.user as any).id,
                    email: (req.user as any).email
                }
            });
        } else {
            res.status(401).json({ message: 'Invalid token' });
        }
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};
