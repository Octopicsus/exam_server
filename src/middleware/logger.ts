import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const ip = req.ip || req.connection.remoteAddress;
    
    console.log(`\n[${timestamp}] Incoming ${method} ${url} from ${ip}`);
    
    if (method === 'POST' && req.body) {
        const bodyToLog = { ...req.body };
        if (bodyToLog.password) {
            bodyToLog.password = '***hidden***';
        }
        console.log('Request body:', JSON.stringify(bodyToLog, null, 2));
    }
    
    next();
};

export const responseLogger = (req: Request, res: Response, next: NextFunction): void => {
    const originalSend = res.send;
    
    res.send = function(data) {
        const timestamp = new Date().toISOString();
        const status = res.statusCode;
        const statusColor = status >= 400 ? '❌' : status >= 300 ? '⚠️' : '✅';
        
        console.log(`[${timestamp}] ${statusColor} Response ${status} for ${req.method} ${req.originalUrl}`);
        
        if (status >= 400 && data) {
            try {
                const responseData = JSON.parse(data);
                console.log('Error response:', JSON.stringify(responseData, null, 2));
            } catch (e) {
                console.log('Error response (raw):', data);
            }
        }
        
        return originalSend.call(this, data);
    };
    
    next();
};
