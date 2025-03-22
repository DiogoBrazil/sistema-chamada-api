export interface IErrorResponseDTO<T = null> {
  message: string;
  data: T;
  status_code: number;
}