declare namespace Express {
    export interface Request {
      user?: {
        id: number;
        fullName: string;
        profile: string;
        cpf: string;
      };
    }
  }