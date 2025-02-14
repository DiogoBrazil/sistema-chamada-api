import { Request, Response, NextFunction } from 'express';

type UserProfile = 'ADMINISTRATOR' | 'DOCTOR' | 'RECEPTIONIST';

export const roleMiddleware = (allowedProfiles: UserProfile[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userProfile = req.user?.profile;

    if (!userProfile) {
      res.status(401).json({ error: 'User not found' });
      return
    }

    if (!allowedProfiles.includes(userProfile as UserProfile)) {
      res.status(403).json({ error: 'Unauthorized access to this profile' });
      return
    }

    next();
  };
};