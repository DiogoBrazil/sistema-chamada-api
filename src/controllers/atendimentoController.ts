import { Request, Response, NextFunction } from 'express';
import { PrismaClient, AtendimentoStatus } from '@prisma/client';
import { getIO } from '../sockets';

const prisma = new PrismaClient();

// Cria um atendimento (agenda o atendimento do paciente)
export const createAtendimento = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { patientId } = req.body;
    // Verifica se o paciente existe
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      res.status(404).json({ error: 'Paciente não encontrado' });
      return;
    }
    const atendimento = await prisma.atendimento.create({
      data: {
        patient: { connect: { id: patientId } },
        status: AtendimentoStatus.AGUARDANDO
      }
    });
    res.status(201).json(atendimento);
  } catch (error) {
    next(error);
  }
};

// Lista os atendimentos ativos (aguardando ou em atendimento)
export const getAtendimentos = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const atendimentos = await prisma.atendimento.findMany({
      where: {
        status: { in: [AtendimentoStatus.AGUARDANDO, AtendimentoStatus.EM_ATENDIMENTO] }
      },
      include: {
        patient: true
      }
    });
    res.json(atendimentos);
  } catch (error) {
    next(error);
  }
};

// Altera o status para "EM_ATENDIMENTO" e emite o evento via Socket.IO
export const callPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const atendimento = await prisma.atendimento.update({
      where: { id: parseInt(id, 10) },
      data: { status: AtendimentoStatus.EM_ATENDIMENTO },
      include: { patient: true }
    });
    // Emite o evento para chamar o paciente
    const io = getIO();
    io.emit('callPatient', atendimento);
    res.json(atendimento);
  } catch (error) {
    next(error);
  }
};

// Finaliza o atendimento (atualiza para FINALIZADO)
export const finishAtendimento = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const atendimento = await prisma.atendimento.update({
      where: { id: parseInt(id, 10) },
      data: { status: AtendimentoStatus.FINALIZADO }
    });
    res.json(atendimento);
  } catch (error) {
    next(error);
  }
};
