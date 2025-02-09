import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

export const loginProfessional = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { cpf, password } = req.body;
    const professional = await prisma.professional.findUnique({
      where: { cpf }
    });
    if (!professional) {
      res.status(404).json({ error: 'Profissional não encontrado' });
      return;
    }
    const valid = await argon2.verify(professional.password, password);
    if (!valid) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }
    // Remover a senha da resposta
    const { password: _, ...professionalData } = professional;
    res.json(professionalData);
  } catch (error) {
    next(error);
  }
};

export const setConsultorio = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { professionalId, consultorio } = req.body;
    const updatedProfessional = await prisma.professional.update({
      where: { id: professionalId },
      data: { currentConsultorio: consultorio }
    });
    // Remover a senha antes de enviar a resposta
    const { password, ...professionalData } = updatedProfessional;
    res.json(professionalData);
  } catch (error) {
    next(error);
  }
};
