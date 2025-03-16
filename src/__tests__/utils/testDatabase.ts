import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export const setupTestDatabase = () => {
  // URL para banco SQLite em memória
  const dbName = `test-${uuidv4()}`;
  process.env.DATABASE_URL = `file:${dbName}?mode=memory&cache=shared`;
  
  const prisma = new PrismaClient();
  
  return prisma;
};

export const clearDatabase = async (prisma: PrismaClient) => {
  // Lista de tabelas que precisam ser limpas
  const tables = [
    'Patient',
    'PatientAddress',
    'Professional',
    'ProfessionalAddress',
    'Attendance',
    'HealthUnit',
    'HealthUnitAddress',
    'Cid',
    'City'
  ];
  
  // Limpar cada tabela
  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
    } catch (error) {
      console.warn(`Could not clear table ${table}:`, error);
    }
  }
};

export const closeDatabase = async (prisma: PrismaClient) => {
  await prisma.$disconnect();
};