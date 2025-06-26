"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./middleware/database");
const index_1 = require("./middleware/index");
const routes_1 = require("./routes");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use(index_1.securityHeaders);
app.use(index_1.corsMiddleware);
app.use(index_1.jsonMiddleware);
app.use(index_1.urlencodedMiddleware);
app.use(index_1.requestLogger);
// Session middleware (должен быть до passport)
app.use(index_1.sessionMiddleware);
// Passport middleware
app.use(index_1.passport.initialize());
app.use(index_1.passport.session());
// Routes
app.use('/api/auth', routes_1.authRoutes);
app.use('/api/users', routes_1.usersRoutes);
app.use('/api/transactions', routes_1.transactionsRoutes);
app.use(index_1.errorHandler);
const startServer = async () => {
    try {
        await (0, database_1.connectDB)();
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Server startup error:', error);
        process.exit(1);
    }
};
startServer();
