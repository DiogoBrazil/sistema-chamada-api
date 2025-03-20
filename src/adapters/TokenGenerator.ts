import jwt from "jsonwebtoken";
import { DecodedToken } from "../interfaces/DecodedToken";

export class TokenGenerator {
  generate(payload: any, expiresIn: string = "24h"): string {
    const secret = process.env.JWT_SECRET || "default_secret";
    return jwt.sign(payload, secret, {
      expiresIn: expiresIn,
    } as jwt.SignOptions);
  }

  verify(token: string): DecodedToken {
    try {
      const secret = process.env.JWT_SECRET || "default_secret";
      const decoded = jwt.verify(token, secret) as DecodedToken;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Token expired");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid token");
      }
      throw error;
    }
  }
}