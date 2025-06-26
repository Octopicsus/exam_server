import cors from 'cors';

export const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001', 'http://localhost:3003'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

export const corsMiddleware = cors(corsOptions);
