import { IAddressDTO } from '../address/IAddressDTO';

export interface ICreatePatientDTO {
  fullName: string;
  socialName: string;
  cpf: string;
  birthDate: string;
  phone?: string;
  sex?: string;
  race?: string;
  address?: IAddressDTO;
}