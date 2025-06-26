import session from 'express-session';
import MongoStore from 'connect-mongo';

const SESSION_SECRET = process.env.SESSION_SECRET || 'session-secret-key';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/finance-spa';

export const sessionMiddleware = session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
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
