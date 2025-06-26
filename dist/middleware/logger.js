"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseLogger = exports.requestLogger = void 0;
const requestLogger = (req, res, next) => {
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
exports.requestLogger = requestLogger;
const responseLogger = (req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
        const timestamp = new Date().toISOString();
        const status = res.statusCode;
        const statusColor = status >= 400 ? '❌' : status >= 300 ? '⚠️' : '✅';
        console.log(`[${timestamp}] ${statusColor} Response ${status} for ${req.method} ${req.originalUrl}`);
        if (status >= 400 && data) {
            try {
                const responseData = JSON.parse(data);
                console.log('Error response:', JSON.stringify(responseData, null, 2));
            }
            catch (e) {
                console.log('Error response (raw):', data);
            }
        }
        return originalSend.call(this, data);
    };
    next();
};
exports.responseLogger = responseLogger;
