import { Request, Response, NextFunction } from 'express';
import { ProfileType, ADMIN_PROFILES } from '../constants/profilesTypes';
import { getPrismaClient } from '../infra/prismaClient';

// Verifica se o usuário tem autorização baseado em seu perfil
export function authorizeRoles(allowedRoles: ProfileType[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Unauthenticated user',
        data: null,
        status_code: 401
      });
    }

    const userProfile = req.user.profile as ProfileType;

    if (!allowedRoles.includes(userProfile)) {
      return res.status(403).json({
        message: 'Insufficient permissions for this operation',
        data: null,
        status_code: 403
      });
    }

    next();
  };
}

// Verifica a autorização por unidade de saúde
export function authorizeHealthUnit(healthUnitIdExtractor: (req: Request) => number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Unauthenticated user',
        data: null,
        status_code: 401
      });
    }

    const userId = req.user.id;
    const userProfile = req.user.profile as ProfileType;
    const targetHealthUnitId = healthUnitIdExtractor(req);

    // GENERAL_ADMINISTRATOR tem acesso a todas as unidades
    if (userProfile === ProfileType.GENERAL_ADMINISTRATOR) {
      return next();
    }

    try {
      // Verifica acesso com base no perfil
      if (userProfile === ProfileType.GENERAL_LOCAL_ADMINISTRATOR) {
        // Verifica se a unidade pertence à cidade do administrador
        const professional = await getPrismaClient().professional.findUnique({
          where: { id: userId },
          include: { city: { include: { healthUnits: true } } }
        });

        if (!professional?.city) {
          return res.status(403).json({
            message: 'Municipal administrator is not linked to any city',
            data: null,
            status_code: 403
          });
        }

        const hasAccess = professional.city.healthUnits.some(unit => unit.id === targetHealthUnitId);
        if (!hasAccess) {
          return res.status(403).json({
            message: 'This health unit does not belong to your city',
            data: null,
            status_code: 403
          });
        }
      } else {
        // Para LOCAL_ADMINISTRATOR e demais perfis
        // Verificar se o profissional está vinculado à unidade
        const professional = await getPrismaClient().professional.findUnique({
          where: { id: userId },
          include: { healthUnit: true }
        });

        if (!professional?.healthUnit) {
          return res.status(403).json({
            message: 'Professional is not linked to any health unit',
            data: null,
            status_code: 403
          });
        }

        const hasAccess = professional.healthUnit.some(unit => unit.id === targetHealthUnitId);
        if (!hasAccess) {
          return res.status(403).json({
            message: 'You do not have permission to access this health facility',
            data: null,
            status_code: 403
          });
        }
      }

      next();
    } catch (error) {
      console.error('Error checking authorization per unit:', error);
      return res.status(500).json({
        message: 'Internal server error',
        data: null,
        status_code: 500
      });
    }
  };
}

// Verifica a autorização por cidade
export function authorizeCity(cityIdExtractor: (req: Request) => number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Unauthenticated user',
        data: null,
        status_code: 401
      });
    }

    const userId = req.user.id;
    const userProfile = req.user.profile as ProfileType;
    const targetCityId = cityIdExtractor(req);

    // GENERAL_ADMINISTRATOR tem acesso a todas as cidades
    if (userProfile === ProfileType.GENERAL_ADMINISTRATOR) {
      return next();
    }

    try {
      if (userProfile === ProfileType.GENERAL_LOCAL_ADMINISTRATOR) {
        // Verificar se o administrador pertence à cidade
        const professional = await getPrismaClient().professional.findUnique({
          where: { id: userId }
        });

        if (!professional?.cityId || professional.cityId !== targetCityId) {
          return res.status(403).json({
            message: 'You do not have permission to access this city',
            data: null,
            status_code: 403
          });
        }
      } else {
        // Para outros perfis, verificar se pertencem a uma unidade na cidade
        const professional = await getPrismaClient().professional.findUnique({
          where: { id: userId },
          include: {
            healthUnit: {
              include: { city: true }
            }
          }
        });

        if (!professional?.healthUnit || professional.healthUnit.length === 0) {
          return res.status(403).json({
            message: 'Professional is not linked to any health unit',
            data: null,
            status_code: 403
          });
        }

        const hasAccess = professional.healthUnit.some(unit => unit.cityId === targetCityId);
        if (!hasAccess) {
          return res.status(403).json({
            message: 'You do not have permission to access this city',
            data: null,
            status_code: 403
          });
        }
      }

      next();
    } catch (error) {
      console.error('Error checking authorization by city:', error);
      return res.status(500).json({
        message: 'Internal server error',
        data: null,
        status_code: 500
      });
    }
  };
}

// Verificação para profissionais (CRUD)
export function authorizeProfessionalManagement() {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Unauthenticated user',
        data: null,
        status_code: 401
      });
    }

    const userProfile = req.user.profile as ProfileType;

    // Somente perfis de administrador podem gerenciar profissionais
    if (!ADMIN_PROFILES.includes(userProfile)) {
      return res.status(403).json({
        message: 'Only administrators can manage professionals',
        data: null,
        status_code: 403
      });
    }

    next();
  };
}

// Verificação específica para verificar se um profissional pode ser gerenciado pelo usuário atual
export function canManageProfessional(professionalIdExtractor: (req: Request) => number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Unauthenticated user',
        data: null,
        status_code: 401
      });
    }

    const userId = req.user.id;
    const userProfile = req.user.profile as ProfileType;
    const targetProfessionalId = professionalIdExtractor(req);

    // Se for o próprio profissional editando seus dados
    if (userId === targetProfessionalId) {
      return next();
    }

    // GENERAL_ADMINISTRATOR pode gerenciar qualquer profissional
    if (userProfile === ProfileType.GENERAL_ADMINISTRATOR) {
      return next();
    }

    //TODO: Código abaixo parece ter lógica repetida.
    try {
      // Buscar o profissional alvo
      const targetProfessional = await getPrismaClient().professional.findUnique({
        where: { id: targetProfessionalId },
        include: {
          healthUnit: { include: { city: true } },
          city: true
        }
      });

      if (!targetProfessional) {
        return res.status(404).json({
          message: 'Professional not found',
          data: null,
          status_code: 404
        });
      }

      // GENERAL_LOCAL_ADMINISTRATOR pode gerenciar profissionais em sua cidade
      if (userProfile === ProfileType.GENERAL_LOCAL_ADMINISTRATOR) {
        const admin = await getPrismaClient().professional.findUnique({
          where: { id: userId },
          include: { city: true }
        });

        if (!admin?.cityId) {
          return res.status(403).json({
            message: 'Municipal administrator is not linked to any city',
            data: null,
            status_code: 403
          });
        }

        // Verifica se o profissional está na mesma cidade
        const isInSameCity = targetProfessional.cityId === admin.cityId ||
          targetProfessional.healthUnit.some(unit => unit.cityId === admin.cityId);

        if (!isInSameCity) {
          return res.status(403).json({
            message: 'You do not have permission to manage this professional',
            data: null,
            status_code: 403
          });
        }
      }
      // LOCAL_ADMINISTRATOR pode gerenciar profissionais em sua unidade
      else if (userProfile === ProfileType.LOCAL_ADMINISTRATOR) {
        const admin = await getPrismaClient().professional.findUnique({
          where: { id: userId },
          include: { healthUnit: true }
        });

        if (!admin?.healthUnit || admin.healthUnit.length === 0) {
          return res.status(403).json({
            message: 'Local administrator is not linked to any health unit',
            data: null,
            status_code: 403
          });
        }

        const adminHealthUnitIds = admin.healthUnit.map(unit => unit.id);
        const hasCommonHealthUnit = targetProfessional.healthUnit.some(unit =>
          adminHealthUnitIds.includes(unit.id)
        );

        if (!hasCommonHealthUnit) {
          return res.status(403).json({
            message: 'You do not have permission to manage this professional',
            data: null,
            status_code: 403
          });
        }
      }

      next();
    } catch (error) {
      console.error('Error checking professional management:', error);
      return res.status(500).json({
        message: 'Internal server error',
        data: null,
        status_code: 500
      });
    }
  };
}
