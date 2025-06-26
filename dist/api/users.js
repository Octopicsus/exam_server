"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.getAllUsers = exports.updateProfile = exports.getProfile = void 0;
const mongodb_1 = require("mongodb");
const database_1 = require("../middleware/database");
const getProfile = async (req, res) => {
    try {
        const db = (0, database_1.getDB)();
        const users = db.collection('users');
        const user = await users.findOne({ _id: new mongodb_1.ObjectId(req.user?.id) }, { projection: { password: 0 } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ user });
    }
    catch (error) {
        console.error('Profile retrieval error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const db = (0, database_1.getDB)();
        const users = db.collection('users');
        const updateData = {
            updatedAt: new Date()
        };
        if (name)
            updateData.name = name;
        if (email)
            updateData.email = email;
        const result = await users.updateOne({ _id: new mongodb_1.ObjectId(req.user?.id) }, { $set: updateData });
        if (result.matchedCount === 0) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ message: 'Profile updated successfully' });
    }
    catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.updateProfile = updateProfile;
const getAllUsers = async (req, res) => {
    try {
        const db = (0, database_1.getDB)();
        const users = db.collection('users');
        const allUsers = await users.find({}, { projection: { password: 0 } }).toArray();
        res.json({ users: allUsers });
    }
    catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.getAllUsers = getAllUsers;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const db = (0, database_1.getDB)();
        const users = db.collection('users');
        const result = await users.deleteOne({ _id: new mongodb_1.ObjectId(id) });
        if (result.deletedCount === 0) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ message: 'User successfully deleted' });
    }
    catch (error) {
        console.error('User deletion error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.deleteUser = deleteUser;
