import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
    user?: {
        _id: string;
        id: string;
        email: string;
    };
}

export interface User {
    _id?: string;
    email: string;
    password: string;
    name?: string;
    createdAt: Date;
    updatedAt: Date;
}
