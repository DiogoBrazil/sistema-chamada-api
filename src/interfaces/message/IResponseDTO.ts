export interface IResponseDTO<T> {
  message: string;
  data: T;
  status_code: number;
}