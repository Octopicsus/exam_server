"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDB = exports.getDB = exports.connectDB = void 0;
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.b3gzjlp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const dbName = 'Octo';
const client = new mongodb_1.MongoClient(uri);
let db = null;
const connectDB = async () => {
    try {
        await client.connect();
        db = client.db(dbName);
        console.log('Connected to MongoDB');
        return db;
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};
exports.connectDB = connectDB;
const getDB = () => {
    if (!db) {
        throw new Error('Database not connected. Call connectDB first.');
    }
    return db;
};
exports.getDB = getDB;
const closeDB = async () => {
    try {
        await client.close();
        console.log('MongoDB connection closed');
    }
    catch (error) {
        console.error('Error closing MongoDB connection:', error);
    }
};
exports.closeDB = closeDB;
