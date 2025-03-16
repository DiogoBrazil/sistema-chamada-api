import { CreateProfessionalUseCase } from '../../../../useCases/professional/CreateProfessionalUseCase';
import { ProfessionalRepository } from '../../../../repositories/ProfessionalRepository';
import { ProfessionalAddressRepository } from '../../../../repositories/ProfessionalAddressRepository';
import { mock, mockReset } from 'jest-mock-extended';
import { ICreateProfessionalDTO } from '../../../../interfaces/professional/ICreateProfessionalDTO';
import { Professional } from '@prisma/client';
import argon2 from 'argon2';

// Mock argon2
jest.mock('argon2', () => ({
  hash: jest.fn().mockImplementation((password) => Promise.resolve(`hashed_${password}`))
}));

describe('CreateProfessionalUseCase', () => {
  const professionalRepositoryMock = mock<ProfessionalRepository>();
  const professionalAddressRepositoryMock = mock<ProfessionalAddressRepository>();
  
  let createProfessionalUseCase: CreateProfessionalUseCase;
  
  beforeEach(() => {
    mockReset(professionalRepositoryMock);
    mockReset(professionalAddressRepositoryMock);
    
    createProfessionalUseCase = new CreateProfessionalUseCase(
      professionalRepositoryMock,
      professionalAddressRepositoryMock
    );
  });
  
  it('should create a professional successfully without address', async () => {
    // Arrange
    const professionalData: ICreateProfessionalDTO = {
      fullName: 'Test Professional',
      cpf: '12345678900',
      email: 'test@example.com',
      password: 'password123',
      profile: 'DOCTOR',
      active: true,
      cityId: 1
    };
    
    const createdProfessional: Professional = {
      id: 1,
      fullName: professionalData.fullName,
      cpf: professionalData.cpf,
      email: professionalData.email,
      password: `hashed_${professionalData.password}`,
      profile: professionalData.profile,
      attendanceMode: null,
      currentOffice: null,
      phone: null,
      sex: null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      cityId: 1
    };
    
    professionalRepositoryMock.getProfessionalByEmail.mockResolvedValue(null);
    professionalRepositoryMock.createProfessional.mockResolvedValue(createdProfessional);
    
    // Act
    const result = await createProfessionalUseCase.execute(professionalData);
    
    // Assert
    expect(argon2.hash).toHaveBeenCalledWith(professionalData.password);
    expect(professionalRepositoryMock.createProfessional).toHaveBeenCalledWith(
      null,
      {
        ...professionalData,
        password: `hashed_${professionalData.password}`
      }
    );
    expect(result).not.toHaveProperty('password');
    expect(result).toEqual(expect.objectContaining({
      id: 1,
      fullName: professionalData.fullName,
      cpf: professionalData.cpf,
      email: professionalData.email,
      profile: professionalData.profile
    }));
  });

  it('should create a professional with address successfully', async () => {
    // Arrange
    const professionalData: ICreateProfessionalDTO = {
      fullName: 'Test Professional',
      cpf: '12345678900',
      email: 'test@example.com',
      password: 'password123',
      profile: 'DOCTOR',
      active: true,
      cityId: 1,
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
    
    const createdProfessional: Professional = {
      id: 1,
      fullName: professionalData.fullName,
      cpf: professionalData.cpf,
      email: professionalData.email,
      password: `hashed_${professionalData.password}`,
      profile: professionalData.profile,
      attendanceMode: null,
      currentOffice: null,
      phone: null,
      sex: null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      cityId: 1
    };
    
    professionalRepositoryMock.getProfessionalByEmail.mockResolvedValue(null);
    professionalRepositoryMock.createProfessional.mockResolvedValue(createdProfessional);
    
    // Act
    const result = await createProfessionalUseCase.execute(professionalData);
    
    // Assert
    expect(professionalRepositoryMock.createProfessional).toHaveBeenCalledWith(
      professionalData.address,
      expect.objectContaining({
        ...professionalData,
        password: `hashed_${professionalData.password}`
      })
    );
    expect(result).not.toHaveProperty('password');
  });

  it('should throw an error if profile is invalid', async () => {
    // Arrange
    const professionalData = {
      fullName: 'Test Professional',
      cpf: '12345678900',
      email: 'test@example.com',
      password: 'password123',
      profile: 'INVALID_PROFILE',
      active: true,
      cityId: 1
    } as ICreateProfessionalDTO;
    
    // Act & Assert
    await expect(createProfessionalUseCase.execute(professionalData))
      .rejects
      .toThrow("Invalid profile. Only 'GENERAL_ADMINISTRATOR', 'LOCAL_ADMINISTRATOR', 'DOCTOR', 'RECEPTIONIST', 'NURSE', 'NURSING_TECHNICIAN', 'ODONTOLOGIST' or 'ACS' are allowed.");
  });

  it('should throw an error if password is not provided', async () => {
    // Arrange
    const professionalData = {
      fullName: 'Test Professional',
      cpf: '12345678900',
      email: 'test@example.com',
      profile: 'DOCTOR',
      active: true,
      cityId: 1
    } as ICreateProfessionalDTO;
    
    // Act & Assert
    await expect(createProfessionalUseCase.execute(professionalData))
      .rejects
      .toThrow("Password is required.");
  });

  it('should throw an error if email is invalid', async () => {
    // Arrange
    const professionalData: ICreateProfessionalDTO = {
      fullName: 'Test Professional',
      cpf: '12345678900',
      email: 'invalid-email',
      password: 'password123',
      profile: 'DOCTOR',
      active: true,
      cityId: 1
    };
    
    // Act & Assert
    await expect(createProfessionalUseCase.execute(professionalData))
      .rejects
      .toThrow("Invalid email.");
  });

  it('should throw an error if email is already in use', async () => {
    // Arrange
    const professionalData: ICreateProfessionalDTO = {
      fullName: 'Test Professional',
      cpf: '12345678900',
      email: 'existing@example.com',
      password: 'password123',
      profile: 'DOCTOR',
      active: true,
      cityId: 1
    };
    
    const existingProfessional: Professional = {
      id: 2,
      fullName: 'Existing Professional',
      cpf: '98765432100',
      email: 'existing@example.com',
      password: 'hashed_password',
      profile: 'DOCTOR',
      attendanceMode: null,
      currentOffice: null,
      phone: null,
      sex: null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      cityId: 1
    };
    
    professionalRepositoryMock.getProfessionalByEmail.mockResolvedValue(existingProfessional);
    
    // Act & Assert
    await expect(createProfessionalUseCase.execute(professionalData))
      .rejects
      .toThrow("Email already in use.");
  });

  it('should throw an error if address is incomplete', async () => {
    // Arrange
    const professionalData: ICreateProfessionalDTO = {
      fullName: 'Test Professional',
      cpf: '12345678900',
      email: 'test@example.com',
      password: 'password123',
      profile: 'DOCTOR',
      active: true,
      cityId: 1,
      address: {
        street: 'Test Street',
        // Missing number
        city: 'Test City',
        state: 'TS'
      } as any
    };
    
    professionalRepositoryMock.getProfessionalByEmail.mockResolvedValue(null);
    
    // Act & Assert
    await expect(createProfessionalUseCase.execute(professionalData))
      .rejects
      .toThrow("Street, city, state and number are required for address");
  });
});