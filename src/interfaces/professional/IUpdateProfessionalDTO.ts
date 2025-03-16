import { IAddressDTO } from '../address/IAddressDTO';

export interface IUpdateProfessionalDTO {
    fullName?: string;
    cpf?: string;
    profile?: string;
    password?: string;
    attendanceMode?: string;
    currentOffice?: number;
    phone?: string;
    sex?: string;
    email?: string;
    active?: boolean;
    cityId?: number;
    healthUnitId?: number;
    address?: IAddressDTO;
}