import { Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../middleware/database';
import { AuthenticatedRequest } from '../types';

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const db = getDB();
        const users = db.collection('users');
        
        const user = await users.findOne(
            { _id: new ObjectId(req.user?.id) },
            { projection: { password: 0 } }
        );
        
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        
        res.json({ user });
    } catch (error) {
        console.error('Profile retrieval error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { name, email } = req.body;
        
        const db = getDB();
        const users = db.collection('users');
        
        const updateData: any = {
            updatedAt: new Date()
        };
        
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        
        const result = await users.updateOne(
            { _id: new ObjectId(req.user?.id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const db = getDB();
        const users = db.collection('users');
        
        const allUsers = await users.find(
            {},
            { projection: { password: 0 } }
        ).toArray();
        
        res.json({ users: allUsers });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        
        const db = getDB();
        const users = db.collection('users');
        
        const result = await users.deleteOne({ _id: new ObjectId(id) });
        
        if (result.deletedCount === 0) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        
        res.json({ message: 'User successfully deleted' });
    } catch (error) {
        console.error('User deletion error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
