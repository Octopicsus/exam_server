"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionsAPI = void 0;
const database_1 = require("../middleware/database");
const mongodb_1 = require("mongodb");
exports.transactionsAPI = {
    // Получить все транзакции пользователя
    async getTransactionsByUserId(userId) {
        try {
            const db = (0, database_1.getDB)();
            const transactions = db.collection('transaction');
            const users = db.collection('users');
            // Получаем email пользователя
            const user = await users.findOne({ _id: new mongodb_1.ObjectId(userId) });
            const userEmail = user?.email || '';
            const result = await transactions
                .find({ userId: new mongodb_1.ObjectId(userId) })
                .sort({ createdAt: -1 })
                .toArray();
            return result.map((transaction) => ({
                ...transaction,
                _id: transaction._id.toString(),
                userId: transaction.userId.toString(),
                userEmail: transaction.userEmail || userEmail // Используем сохраненный email или текущий
            }));
        }
        catch (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }
    },
    // Создать новую транзакцию
    async createTransaction(transactionData) {
        try {
            const db = (0, database_1.getDB)();
            const transactions = db.collection('transaction');
            const users = db.collection('users');
            // Получаем email пользователя
            const user = await users.findOne({ _id: new mongodb_1.ObjectId(transactionData.userId) });
            const userEmail = user?.email || '';
            const newTransaction = {
                ...transactionData,
                userId: new mongodb_1.ObjectId(transactionData.userId),
                userEmail,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const result = await transactions.insertOne(newTransaction);
            return {
                ...newTransaction,
                _id: result.insertedId.toString(),
                userId: transactionData.userId,
                userEmail
            };
        }
        catch (error) {
            console.error('Error creating transaction:', error);
            throw error;
        }
    },
    // Обновить транзакцию
    async updateTransaction(transactionId, userId, updateData) {
        try {
            const db = (0, database_1.getDB)();
            const transactions = db.collection('transaction');
            const result = await transactions.findOneAndUpdate({
                _id: new mongodb_1.ObjectId(transactionId),
                userId: new mongodb_1.ObjectId(userId)
            }, {
                $set: {
                    ...updateData,
                    updatedAt: new Date()
                }
            }, { returnDocument: 'after' });
            if (result.value) {
                return {
                    ...result.value,
                    _id: result.value._id.toString(),
                    userId: result.value.userId.toString()
                };
            }
            return null;
        }
        catch (error) {
            console.error('Error updating transaction:', error);
            throw error;
        }
    },
    // Удалить транзакцию
    async deleteTransaction(transactionId, userId) {
        try {
            const db = (0, database_1.getDB)();
            const transactions = db.collection('transaction');
            const result = await transactions.deleteOne({
                _id: new mongodb_1.ObjectId(transactionId),
                userId: new mongodb_1.ObjectId(userId)
            });
            return result.deletedCount === 1;
        }
        catch (error) {
            console.error('Error deleting transaction:', error);
            throw error;
        }
    }
};
