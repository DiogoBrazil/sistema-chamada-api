import { IResponseDTO } from "../interfaces/message/IResponseDTO";

export const createSuccessResponse = <T>(
  message: string,
  data: T,
  status_code: number = 200
): IResponseDTO<T> => {
  return {
    message,
    data,
    status_code,
  };
};

export const successMessages = {
  CREATED: "Created successfully",
  UPDATED: "Updated successfully",
  DELETED: "Deleted successfully",
  FETCHED: "Data retrieved successfully",
  AUTHENTICATED: "Authenticated successfully",
};