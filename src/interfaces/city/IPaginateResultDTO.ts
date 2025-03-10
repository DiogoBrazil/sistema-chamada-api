export interface IPaginatedResult<T> {
    data: T[];
    totalPages: number;
    currentPage: number;
    totalItems: number;
  }