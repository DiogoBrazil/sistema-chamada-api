import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAtendimentosReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { professionalId, startDate, startTime, endDate, endTime } = req.params;
    const professionalIdNum = Number(professionalId);
    if (isNaN(professionalIdNum)) {
      res.status(400).json({ error: 'professionalId inválido' });
      return;
    }
    
    // Combina data e hora para formar os objetos Date
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    // Verifica se as datas são válidas
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      res.status(400).json({ error: 'Data e/ou hora inválida(s)' });
      return;
    }

    // Consulta os atendimentos finalizados pelo profissional no intervalo especificado
    const atendimentos = await prisma.atendimento.findMany({
      where: {
        professionalId: professionalIdNum,
        finishedAt: {
          gte: startDateTime,
          lte: endDateTime,
        },
        status: 'FINALIZADO'
      }
    });

    res.json({ count: atendimentos.length, atendimentos });
  } catch (error) {
    next(error);
  }
};
