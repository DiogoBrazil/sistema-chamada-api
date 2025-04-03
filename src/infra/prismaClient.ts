import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient | null = null;

//TODO: Remover todos os new PrismaClient() do código e substituir por este getPrismaClient()
// Isto vai diminiuir o número de conexões abertas ao banco de dados, pois o PrismaClient é singleton.
export function getPrismaClient() {
    if (prisma == null) {
        prisma = new PrismaClient();
    }

    return prisma;
}
