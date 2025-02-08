import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createPatient = async (req: Request, res: Response) => {
  try {
    const { fullName, cpf, birthDate } = req.body;
    const patient = await prisma.patient.create({
      data: {
        fullName,
        cpf,
        birthDate
      }
    });
    res.status(201).json(patient);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPatients = async (req: Request, res: Response) => {
  try {
    const patients = await prisma.patient.findMany();
    res.json(patients);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPatientById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(id, 10) },
      include: { atendimentos: true }
    });
    if (!patient) {
      res.status(404).json({ error: 'Paciente não encontrado' });
      return;
    }
    res.json(patient);
  } catch (error) {
    next(error);
  }
};
