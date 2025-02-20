import { Professional } from "@prisma/client";

export interface IPaginatedProfessionalResult {
    data: Omit<Professional, "password">[];
    totalPages: number;
    currentPage: number;
    totalItems: number;
}