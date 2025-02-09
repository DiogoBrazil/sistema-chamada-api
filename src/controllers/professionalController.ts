import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

export const createProfessional = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fullName, cpf, profile, password } = req.body;
    
    const allowedProfiles = ["MEDICO", "RECEPCIONISTA"];
    if (!allowedProfiles.includes(profile)) {
      res.status(400).json({ error: "Perfil inválido. Apenas 'MEDICO' ou 'RECEPCIONISTA' são permitidos." });
      return;
    }
    
    if (!password) {
      res.status(400).json({ error: 'Password é obrigatório' });
      return;
    }
    
    const hashedPassword = await argon2.hash(password);
    const professional = await prisma.professional.create({
      data: { fullName, cpf, profile, password: hashedPassword }
    });
    // Remover a senha da resposta
    const { password: _, ...professionalData } = professional;
    res.status(201).json(professionalData);
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
    const professionalsWithoutPassword = professionals.map(({ password, ...rest }) => rest);
    res.json(professionalsWithoutPassword);
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
    // Remover a senha antes de enviar
    const { password, ...professionalData } = professional;
    res.json(professionalData);
  } catch (error) {
    next(error);
  }
};
