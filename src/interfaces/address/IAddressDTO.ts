export interface IAddressDTO {
    street: string;
    number: string;
    complement?: string;
    neighborhood?: string;
    city: string;
    state: string;
    zipCode?: string;
    isMain?: boolean;
  }