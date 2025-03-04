import { Request, Response, NextFunction } from 'express';
import { container } from '../container';
import { TYPES } from '../types';
import { VerifyLocalAdminAccessUseCase } from '../useCases/professional/VerifyLocalAdminAccessUseCase';

export function roleMiddleware(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Verificar se o usuário está autenticado
    if (!req.user) {
      return res.status(401).json({
        message: 'User not authenticated',
        data: null,
        status_code: 401
      });
    }
    
    // Se ADMINISTRATOR estiver na lista de papéis permitidos, incluir automaticamente
    // ambos os tipos de administradores (GENERAL_ADMINISTRATOR e LOCAL_ADMINISTRATOR)
    const expandedRoles = [...allowedRoles];
    if (allowedRoles.includes('ADMINISTRATOR')) {
      if (!expandedRoles.includes('GENERAL_ADMINISTRATOR')) {
        expandedRoles.push('GENERAL_ADMINISTRATOR');
      }
      if (!expandedRoles.includes('LOCAL_ADMINISTRATOR')) {
        expandedRoles.push('LOCAL_ADMINISTRATOR');
      }
    }

    // Verificar se o papel do usuário está na lista de papéis permitidos
    if (!expandedRoles.includes(req.user.profile)) {
      return res.status(403).json({
        message: 'Insufficient permissions for this operation',
        data: null,
        status_code: 403
      });
    }

    // Se chegou aqui, o usuário tem permissão
    next();
  };
}

// Middleware específico para verificar permissões do administrador local
// apenas permitindo acesso a recursos da sua própria unidade de saúde
export function localAdminMiddleware(healthUnitIdExtractor: (req: Request) => number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Se não for LOCAL_ADMINISTRATOR, prossegue normalmente
    if (req.user?.profile !== 'LOCAL_ADMINISTRATOR') {
      return next();
    }
    
    // Para LOCAL_ADMINISTRATOR, verificar se está acessando sua própria unidade
    try {
      const userId = req.user.id;
      const targetHealthUnitId = healthUnitIdExtractor(req);
      
      const verifyUseCase = container.get<VerifyLocalAdminAccessUseCase>(TYPES.VerifyLocalAdminAccessUseCase);
      const hasAccess = await verifyUseCase.execute(userId, targetHealthUnitId);
      
      if (!hasAccess) {
        return res.status(403).json({
          message: 'As a local administrator, you can only manage your own health unit',
          data: null,
          status_code: 403
        });
      }
      
      next();
    } catch (error) {
      console.error('Error in localAdminMiddleware:', error);
      res.status(500).json({
        message: 'Internal server error',
        data: null,
        status_code: 500
      });
    }
  };
}


// import { Request, Response, NextFunction } from 'express';

// type UserProfile = 'ADMINISTRATOR' | 'DOCTOR' | 'RECEPTIONIST';

// export const roleMiddleware = (allowedProfiles: UserProfile[]) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     const userProfile = req.user?.profile;

//     if (!userProfile) {
//       res.status(401).json({ error: 'User not found' });
//       return
//     }

//     if (!allowedProfiles.includes(userProfile as UserProfile)) {
//       res.status(403).json({ error: 'Unauthorized access to this profile' });
//       return
//     }

//     next();
//   };
// };