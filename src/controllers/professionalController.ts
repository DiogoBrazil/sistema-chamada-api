import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createProfessional = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fullName, cpf, profile } = req.body;
    const professional = await prisma.professional.create({
      data: { fullName, cpf, profile }
    });
    res.status(201).json(professional);
  } catch (error) {
    next(error);
  }
};

export const getProfessionals = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const professionals = await prisma.professional.findMany();
    res.json(professionals);
  } catch (error) {
    next(error);
  }
};

export const getProfessionalById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const professional = await prisma.professional.findUnique({
      where: { id: parseInt(id, 10) }
    });
    if (!professional) {
      res.status(404).json({ error: 'Profissional não encontrado' });
      return;
    }
    res.json(professional);
  } catch (error) {
    next(error);
  }
};
