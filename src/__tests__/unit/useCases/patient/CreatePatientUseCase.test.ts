import { CreatePatientUseCase } from '../../../../useCases/patient/CreatePatientUseCase';
import { PatientRepository } from '../../../../repositories/PatientRepository';
import { PatientAddressRepository } from '../../../../repositories/PatientAddressRepository';
import { mock, mockReset } from 'jest-mock-extended';
import { ICreatePatientDTO } from '../../../../interfaces/patient/ICreatePatientDTO';
import { Patient } from '@prisma/client';

describe('CreatePatientUseCase', () => {
  const patientRepositoryMock = mock<PatientRepository>();
  const patientAddressRepositoryMock = mock<PatientAddressRepository>();
  
  let createPatientUseCase: CreatePatientUseCase;
  
  beforeEach(() => {
    mockReset(patientRepositoryMock);
    mockReset(patientAddressRepositoryMock);
    
    createPatientUseCase = new CreatePatientUseCase(
      patientRepositoryMock,
      patientAddressRepositoryMock
    );
  });
  
  it('should create a patient successfully without address', async () => {
    // Arrange
    const patientData: ICreatePatientDTO = {
      fullName: 'Test Patient',
      socialName: 'Test',
      cpf: '12345678900',
      birthDate: '2000-01-01',
      phone: '1234567890',
      sex: 'M',
      race: 'BRANCO'
    };
    
    const createdPatient: Patient = {
      id: 1,
      fullName: patientData.fullName,
      socialName: patientData.socialName,
      cpf: patientData.cpf,
      birthDate: new Date(patientData.birthDate),
      phone: patientData.phone,
      sex: patientData.sex,
      race: patientData.race,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    patientRepositoryMock.createPatient.mockResolvedValue(createdPatient);
    
    // Act
    const result = await createPatientUseCase.execute(patientData);
    
    // Assert
    expect(patientRepositoryMock.createPatient).toHaveBeenCalledWith(
      null,
      patientData
    );
    expect(result).toEqual(createdPatient);
  });

  it('should create a patient with address successfully', async () => {
    // Arrange
    const patientData: ICreatePatientDTO = {
      fullName: 'Test Patient',
      socialName: 'Test',
      cpf: '12345678900',
      birthDate: '2000-01-01',
      phone: '1234567890',
      sex: 'M',
      race: 'BRANCO',
      address: {
        street: 'Test Street',
        number: '123',
        complement: 'Apt 101',
        neighborhood: 'Test Neighborhood',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345-000',
        isMain: true
      }
    };
    
    const createdPatient: Patient = {
      id: 1,
      fullName: patientData.fullName,
      socialName: patientData.socialName,
      cpf: patientData.cpf,
      birthDate: new Date(patientData.birthDate),
      phone: patientData.phone,
      sex: patientData.sex,
      race: patientData.race,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    patientRepositoryMock.createPatient.mockResolvedValue(createdPatient);
    
    // Act
    const result = await createPatientUseCase.execute(patientData);
    
    // Assert
    expect(patientRepositoryMock.createPatient).toHaveBeenCalledWith(
      patientData.address,
      patientData
    );
    expect(result).toEqual(createdPatient);
  });

  it('should throw an error if socialName is not provided', async () => {
    // Arrange
    const patientData = {
      fullName: 'Test Patient',
      socialName: '',  // Empty social name
      cpf: '12345678900',
      birthDate: '2000-01-01'
    } as ICreatePatientDTO;
    
    // Act & Assert
    await expect(createPatientUseCase.execute(patientData))
      .rejects
      .toThrow('Social name is required');
  });

  it('should throw an error if address is incomplete', async () => {
    // Arrange
    const patientData: ICreatePatientDTO = {
      fullName: 'Test Patient',
      socialName: 'Test',
      cpf: '12345678900',
      birthDate: '2000-01-01',
      address: {
        street: 'Test Street',
        // Missing number
        city: 'Test City',
        state: 'TS'
      } as any
    };
    
    // Act & Assert
    await expect(createPatientUseCase.execute(patientData))
      .rejects
      .toThrow('Street, city, state and number are required for address');
  });
});