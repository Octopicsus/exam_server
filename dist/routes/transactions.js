"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const transactions_1 = require("../api/transactions");
const router = (0, express_1.Router)();
// Middleware для проверки аутентификации
const authenticateJWT = passport_1.default.authenticate('jwt', { session: false });
// GET /api/transactions - получить все транзакции пользователя
router.get('/', authenticateJWT, async (req, res) => {
    try {
        const user = req.user;
        if (!user?._id) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const transactions = await transactions_1.transactionsAPI.getTransactionsByUserId(user._id);
        res.json({ transactions, total: transactions.length });
    }
    catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// POST /api/transactions - создать новую транзакцию
router.post('/', authenticateJWT, async (req, res) => {
    try {
        const user = req.user;
        if (!user?._id) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const { type, title, description, amount, originalAmount, originalCurrency, date, time, img, color } = req.body;
        // Валидация обязательных полей
        if (!type || !title || !description || !amount || !originalAmount || !originalCurrency || !date || !time || !img || !color) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }
        const transactionData = {
            userId: user._id,
            userEmail: user.email,
            type,
            title,
            description,
            amount: Number(amount),
            originalAmount: Number(originalAmount),
            originalCurrency,
            date,
            time,
            img,
            color
        };
        const newTransaction = await transactions_1.transactionsAPI.createTransaction(transactionData);
        res.status(201).json(newTransaction);
    }
    catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// PUT /api/transactions/:id - обновить транзакцию
router.put('/:id', authenticateJWT, async (req, res) => {
    try {
        const user = req.user;
        if (!user?._id) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const { id } = req.params;
        const updateData = req.body;
        // Удаляем поля, которые нельзя обновить
        delete updateData._id;
        delete updateData.userId;
        delete updateData.createdAt;
        const updatedTransaction = await transactions_1.transactionsAPI.updateTransaction(id, user._id, updateData);
        if (!updatedTransaction) {
            res.status(404).json({ message: 'Transaction not found' });
            return;
        }
        res.json(updatedTransaction);
    }
    catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// DELETE /api/transactions/:id - удалить транзакцию
router.delete('/:id', authenticateJWT, async (req, res) => {
    try {
        const user = req.user;
        if (!user?._id) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const { id } = req.params;
        const deleted = await transactions_1.transactionsAPI.deleteTransaction(id, user._id);
        if (!deleted) {
            res.status(404).json({ message: 'Transaction not found' });
            return;
        }
        res.json({ message: 'Transaction deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
