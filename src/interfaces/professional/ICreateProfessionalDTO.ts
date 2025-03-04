import { IAddressDTO } from '../address/IAddressDTO';

export interface ICreateProfessionalDTO {
  fullName: string;
  cpf: string;
  profile: string;
  password: string;
  attendanceMode?: string;
  phone?: string;
  sex?: string;
  email?: string;
  address?: IAddressDTO;
  healthUnitId?: number;
}