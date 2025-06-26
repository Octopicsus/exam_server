"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionsRoutes = exports.usersRoutes = exports.authRoutes = void 0;
const auth_1 = __importDefault(require("./auth"));
exports.authRoutes = auth_1.default;
const users_1 = __importDefault(require("./users"));
exports.usersRoutes = users_1.default;
const transactions_1 = __importDefault(require("./transactions"));
exports.transactionsRoutes = transactions_1.default;
