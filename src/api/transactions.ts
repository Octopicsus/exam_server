import { getDB } from '../middleware/database';
import { ObjectId } from 'mongodb';

export interface Transaction {
    _id?: string;
    userId: string;
    userEmail?: string;
    type: string;
    title: string;
    description: string;
    amount: number;
    originalAmount: number;
    originalCurrency: string;
    date: string;
    time: string;
    img: string;
    color: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export const transactionsAPI = {
    // Получить все транзакции пользователя
    async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
        try {
            const db = getDB();
            const transactions = db.collection('transaction');
            const users = db.collection('users');
            
            // Получаем email пользователя
            const user = await users.findOne({ _id: new ObjectId(userId) });
            const userEmail = user?.email || '';
            
            const result = await transactions
                .find({ userId: new ObjectId(userId) })
                .sort({ createdAt: -1 })
                .toArray();
                
            return result.map((transaction: any) => ({
                ...transaction,
                _id: transaction._id.toString(),
                userId: transaction.userId.toString(),
                userEmail: transaction.userEmail || userEmail // Используем сохраненный email или текущий
            }));
        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }
    },

    // Создать новую транзакцию
    async createTransaction(transactionData: Omit<Transaction, '_id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
        try {
            const db = getDB();
            const transactions = db.collection('transaction');
            const users = db.collection('users');
            
            // Получаем email пользователя
            const user = await users.findOne({ _id: new ObjectId(transactionData.userId) });
            const userEmail = user?.email || '';
            
            const newTransaction = {
                ...transactionData,
                userId: new ObjectId(transactionData.userId),
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
        } catch (error) {
            console.error('Error creating transaction:', error);
            throw error;
        }
    },

    // Обновить транзакцию
    async updateTransaction(transactionId: string, userId: string, updateData: Partial<Transaction>): Promise<Transaction | null> {
        try {
            const db = getDB();
            const transactions = db.collection('transaction');
            
            const result = await transactions.findOneAndUpdate(
                { 
                    _id: new ObjectId(transactionId),
                    userId: new ObjectId(userId)
                },
                { 
                    $set: { 
                        ...updateData,
                        updatedAt: new Date()
                    }
                },
                { returnDocument: 'after' }
            );
            
            if (result.value) {
                return {
                    ...result.value,
                    _id: result.value._id.toString(),
                    userId: result.value.userId.toString()
                };
            }
            
            return null;
        } catch (error) {
            console.error('Error updating transaction:', error);
            throw error;
        }
    },

    // Удалить транзакцию
    async deleteTransaction(transactionId: string, userId: string): Promise<boolean> {
        try {
            const db = getDB();
            const transactions = db.collection('transaction');
            
            const result = await transactions.deleteOne({
                _id: new ObjectId(transactionId),
                userId: new ObjectId(userId)
            });
            
            return result.deletedCount === 1;
        } catch (error) {
            console.error('Error deleting transaction:', error);
            throw error;
        }
    }
};
