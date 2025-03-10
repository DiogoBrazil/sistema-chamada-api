import { IAddressDTO } from '../address/IAddressDTO';

export interface IUpdateHealthUnitDTO {
    name: string;
    cnpj: string;
    phone?: string;
    cityId: number;
    address?: IAddressDTO;
  }