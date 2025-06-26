import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './middleware/database';
import { 
    corsMiddleware, 
    jsonMiddleware, 
    urlencodedMiddleware,
    errorHandler,
    requestLogger,
    securityHeaders,
    sessionMiddleware,
    passport
} from './middleware/index';
import { authRoutes, usersRoutes, transactionsRoutes } from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(jsonMiddleware);
app.use(urlencodedMiddleware);
app.use(requestLogger);

// Session middleware (должен быть до passport)
app.use(sessionMiddleware);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/transactions', transactionsRoutes);

app.use(errorHandler);


const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    } catch (error) {
        console.error('Server startup error:', error);
        process.exit(1);
    }
};

startServer();