import { Request, Response, NextFunction } from "express";
import { DecodedToken } from "../interfaces/DecodedToken";
import { TokenGenerator } from "../adapters/TokenGenerator";
import { container } from "../container";
import { TYPES } from "../types";

declare global {
    namespace Express {
        interface Request {
            user?: Omit<DecodedToken, 'iat' | 'exp'>; // Remove campos temporários
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

    try {
        const tokenGenerator = container.get<TokenGenerator>(TYPES.TokenGenerator);
        const decoded = tokenGenerator.verify(token);
        
        const now = Math.floor(Date.now() / 1000);

        if (decoded.exp < now) {
            return res.status(401).json({ error: "Token expired." });
        }

        req.user = {
            id: decoded.id,
            fullName: decoded.fullName,
            cpf: decoded.cpf,
            profile: decoded.profile
        };

        next();
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "Token expired") {
                return res.status(401).json({ error: "Token expired." });
            }
            if (error.message === "Invalid token") {
                return res.status(401).json({ error: "Token invalid." });
            }
        }
        return res.status(500).json({ error: "Error to validate token" });
    }
};