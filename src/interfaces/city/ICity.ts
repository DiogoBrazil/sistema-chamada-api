import { City } from "@prisma/client";

export interface ICityWithRelations extends City {
    healthUnits?: { id: number; name: string; }[];
    professionals?: { id: number; fullName: string; }[];
  }