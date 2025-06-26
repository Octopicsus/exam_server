import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { getDB } from '../middleware/database';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key';

export interface TokenPayload {
    id: string;
    email: string;
    type: 'access' | 'refresh';
}

export const generateTokens = (userId: string, email: string) => {
    const accessToken = jwt.sign(
        { id: userId, email, type: 'access' },
        JWT_SECRET,
        { expiresIn: '15m' } // Короткий срок жизни для access token
    );

    const refreshToken = jwt.sign(
        { id: userId, email, type: 'refresh' },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' } // Длинный срок жизни для refresh token
    );

    return { accessToken, refreshToken };
};

export const generateAccessToken = (userId: string, email: string) => {
    return jwt.sign(
        { id: userId, email, type: 'access' },
        JWT_SECRET,
        { expiresIn: '15m' }
    );
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
        if (decoded.type !== 'refresh') {
            return null;
        }
        return decoded;
    } catch (error) {
        return null;
    }
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
        if (decoded.type !== 'access') {
            return null;
        }
        return decoded;
    } catch (error) {
        return null;
    }
};

export const saveRefreshToken = async (userId: string, refreshToken: string) => {
    try {
        const db = getDB();
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
    } catch (error) {
        console.error('Error saving refresh token:', error);
        throw error;
    }
};

export const validateRefreshToken = async (refreshToken: string): Promise<boolean> => {
    try {
        const db = getDB();
        const refreshTokens = db.collection('refresh_tokens');
        
        const tokenDoc = await refreshTokens.findOne({
            token: refreshToken,
            expiresAt: { $gt: new Date() }
        });
        
        return !!tokenDoc;
    } catch (error) {
        console.error('Error validating refresh token:', error);
        return false;
    }
};

export const removeRefreshToken = async (refreshToken: string) => {
    try {
        const db = getDB();
        const refreshTokens = db.collection('refresh_tokens');
        
        await refreshTokens.deleteOne({ token: refreshToken });
    } catch (error) {
        console.error('Error removing refresh token:', error);
        throw error;
    }
};
