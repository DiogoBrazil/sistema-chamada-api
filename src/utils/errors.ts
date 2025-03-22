import { IErrorResponseDTO } from "../interfaces/message/IErrorResponseDTO";

export const createErrorResponse = <T = null>(
  message: string,
  status_code: number = 400,
  data: T = null as unknown as T
): IErrorResponseDTO<T> => {
  return {
    message,
    data,
    status_code,
  };
};

export const errorMessages = {
  NOT_FOUND: "Resource not found",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Access forbidden",
  ALREADY_EXISTS: "Resource already exists",
  INVALID_DATA: "Invalid data provided",
  INTERNAL_ERROR: "Internal server error",
  BAD_REQUEST: "Bad request",
  INVALID_CREDENTIALS: "Invalid credentials",
};