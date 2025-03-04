import { IAddressDTO } from "../address/IAddressDTO";


export interface ICreateHealthUnitDTO {
  name: string;
  cnpj: string;
  phone?: string;
  address?: IAddressDTO;
}