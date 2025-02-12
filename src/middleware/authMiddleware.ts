import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

interface DecodedToken {
    fullName: string;
    cpf: string;
    profile: string;
    iat: number;
    exp: number;
}

declare global {
    namespace Express {
        interface Request {
            user?: DecodedToken;
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "Token not provided." });
    }

    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Invalid token format." });
    }

    const token = authHeader.substring(7);

    if (!JWT_SECRET) {
        return res.status(500).json({ error: "JWT_SECRET is not defined." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET as string) as unknown as DecodedToken;
        
        const now = Math.floor(Date.now() / 1000);

        if (decoded.exp && decoded.exp < now) {
            return res.status(401).json({ error: "Token expired." });
        }

        req.user = decoded;

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ error: "Token expired." });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ error: "Token invalid." });
        }
        return res.status(500).json({ error: "Error to validate token" });
    }
};