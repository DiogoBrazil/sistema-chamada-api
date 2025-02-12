import { Request, Response, NextFunction } from "express";

const API_KEY = process.env.API_KEY;

export const apiLeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers["api_key"];

    if (!apiKey) {
        res.status(401).json({ error: "API key is required" });
    }

    if (apiKey !== API_KEY) {
        res.status(401).json({ error: "Invalid api_key" });
        return;
    }
    next();
};