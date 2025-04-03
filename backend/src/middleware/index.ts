import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, 
    message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true, 
    legacyHeaders: false 
});

export const setupMiddleware = (app: express.Application) => {
    app.use(limiter);
    app.use(cors());
    app.use(express.json());
}; 