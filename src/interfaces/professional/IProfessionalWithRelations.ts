import { Professional, ProfessionalAddress, HealthUnit } from "@prisma/client";

export type ProfessionalWithRelations = Professional & {
    addresses: ProfessionalAddress[];
    healthUnit: HealthUnit[]; 
  };