import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.b3gzjlp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const dbName = 'Octo';

const client = new MongoClient(uri);

let db: any = null;

export const connectDB = async () => {
    try {
        await client.connect();
        db = client.db(dbName);
        console.log('Connected to MongoDB');
        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

export const getDB = () => {
    if (!db) {
        throw new Error('Database not connected. Call connectDB first.');
    }
    return db;
};

export const closeDB = async () => {
    try {
        await client.close();
        console.log('MongoDB connection closed');
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
    }
};
