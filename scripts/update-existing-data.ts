import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Migrar dados de endereço existentes (se houver)
  console.log('Iniciando migração de dados...');
  
  // 1. Para cada paciente, verificar se já existe um endereço
  const patients = await prisma.patient.findMany();
  
  for (const patient of patients) {
    // Se o paciente não tiver um endereço na nova tabela
    const hasAddress = await prisma.patientAddress.findFirst({
      where: { patientId: patient.id }
    });
    
    if (!hasAddress) {
      console.log(`Criando endereço padrão para paciente ${patient.id} - ${patient.fullName}`);
      // Criar um endereço padrão vazio (ou use dados antigos se você tinha em algum lugar)
      await prisma.patientAddress.create({
        data: {
          patientId: patient.id,
          street: "Endereço a confirmar",
          city: "Cidade a confirmar",
          state: "Estado a confirmar",
          zipCode: "00000-000",
          isMain: true
        }
      });
    }
  }

  // 2. Para cada profissional, verificar se já existe um endereço
  const professionals = await prisma.professional.findMany();
  
  for (const professional of professionals) {
    const hasAddress = await prisma.professionalAddress.findFirst({
      where: { professionalId: professional.id }
    });
    
    if (!hasAddress) {
      console.log(`Criando endereço padrão para profissional ${professional.id} - ${professional.fullName}`);
      await prisma.professionalAddress.create({
        data: {
          professionalId: professional.id,
          street: "Endereço a confirmar",
          city: "Cidade a confirmar",
          state: "Estado a confirmar",
          zipCode: "00000-000",
          isMain: true
        }
      });
    }
  }
  
  console.log('Migração de dados concluída!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });