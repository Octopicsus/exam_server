import express from 'express';

export const jsonMiddleware = express.json();
export const urlencodedMiddleware = express.urlencoded({ extended: true });
