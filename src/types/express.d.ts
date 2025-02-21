import { DecodedToken } from "../interfaces/DecodedToken";

declare global {
    namespace Express {
        interface Request {
            user?: Pick<DecodedToken, 'id' | 'fullName' | 'cpf' | 'profile'>;
        }
    }
}