import { CreateProfessionalByGeneralAdminUseCase } from '../../../../useCases/professional/CreateProfessionalByGeneralAdminUseCase';
import { CreateProfessionalUseCase } from '../../../../useCases/professional/CreateProfessionalUseCase';
import { HealthUnitRepository } from '../../../../repositories/HealthUnitRepository';
import { mock, mockReset } from 'jest-mock-extended';
import { ICreateProfessionalDTO } from '../../../../interfaces/professional/ICreateProfessionalDTO';
import { Professional, HealthUnit } from '@prisma/client';

describe('CreateProfessionalByGeneralAdminUseCase', () => {
  const createProfessionalUseCaseMock = mock<CreateProfessionalUseCase>();
  const healthUnitRepositoryMock = mock<HealthUnitRepository>();
  
  let createProfessionalByGeneralAdminUseCase: CreateProfessionalByGeneralAdminUseCase;
  
  beforeEach(() => {
    mockReset(createProfessionalUseCaseMock);
    mockReset(healthUnitRepositoryMock);
    
    createProfessionalByGeneralAdminUseCase = new CreateProfessionalByGeneralAdminUseCase(
      createProfessionalUseCaseMock,
      healthUnitRepositoryMock
    );
  });
  
  it('should create a GENERAL_ADMINISTRATOR professional without health unit', async () => {
    // Arrange
    const professionalData: ICreateProfessionalDTO = {
      fullName: 'Admin User',
      cpf: '12345678900',
      email: 'admin@example.com',
      password: 'password123',
      profile: 'GENERAL_ADMINISTRATOR',
      active: true,
      cityId: 1
    };
    
    const createdProfessional = {
      id: 1,
      fullName: professionalData.fullName,
      cpf: professionalData.cpf,
      email: professionalData.email,
      profile: professionalData.profile,
      active: true,
      cityId: 1
    };
    
    createProfessionalUseCaseMock.execute.mockResolvedValue(createdProfessional as any);
    
    // Act
    const result = await createProfessionalByGeneralAdminUseCase.execute(professionalData);
    
    // Assert
    expect(createProfessionalUseCaseMock.execute).toHaveBeenCalledWith(
      professionalData
    );
    expect(healthUnitRepositoryMock.addProfessionalToHealthUnit).not.toHaveBeenCalled();
    expect(result).toEqual(createdProfessional);
  });
  
  it('should create a non-admin professional and link to health unit', async () => {
    // Arrange
    const healthUnit: HealthUnit = {
      id: 1,
      name: 'Test Health Unit',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      cityId: 1
    };
    
    const professionalData: ICreateProfessionalDTO = {
      fullName: 'Doctor User',
      cpf: '12345678900',
      email: 'doctor@example.com',
      password: 'password123',
      profile: 'DOCTOR',
      active: true,
      cityId: 1,
      healthUnitId: healthUnit.id
    };
    
    const createdProfessional = {
      id: 2,
      fullName: professionalData.fullName,
      cpf: professionalData.cpf,
      email: professionalData.email,
      profile: professionalData.profile,
      active: true,
      cityId: 1
    };
    
    healthUnitRepositoryMock.getHealthUnitById.mockResolvedValue(healthUnit);
    createProfessionalUseCaseMock.execute.mockResolvedValue(createdProfessional as any);
    
    // Act
    const result = await createProfessionalByGeneralAdminUseCase.execute(professionalData);
    
    // Assert
    expect(healthUnitRepositoryMock.getHealthUnitById).toHaveBeenCalledWith(healthUnit.id);
    expect(createProfessionalUseCaseMock.execute).toHaveBeenCalledWith(
      expect.not.objectContaining({ healthUnitId: healthUnit.id })
    );
    expect(healthUnitRepositoryMock.addProfessionalToHealthUnit).toHaveBeenCalledWith(
      healthUnit.id,
      createdProfessional.id
    );
    expect(result).toEqual(createdProfessional);
  });
  
  it('should throw error if non-admin professional is created without health unit', async () => {
    // Arrange
    const professionalData: ICreateProfessionalDTO = {
      fullName: 'Doctor User',
      cpf: '12345678900',
      email: 'doctor@example.com',
      password: 'password123',
      profile: 'DOCTOR',
      active: true,
      cityId: 1
      // Missing healthUnitId
    };
    
    // Act & Assert
    await expect(createProfessionalByGeneralAdminUseCase.execute(professionalData))
      .rejects
      .toThrow("Health unit is required for non-general administrator profiles");
  });
  
  it('should throw error if health unit does not exist', async () => {
    // Arrange
    const professionalData: ICreateProfessionalDTO = {
      fullName: 'Doctor User',
      cpf: '12345678900',
      email: 'doctor@example.com',
      password: 'password123',
      profile: 'DOCTOR',
      active: true,
      cityId: 1,
      healthUnitId: 999 // Non-existent health unit
    };
    
    healthUnitRepositoryMock.getHealthUnitById.mockResolvedValue(null);
    
    // Act & Assert
    await expect(createProfessionalByGeneralAdminUseCase.execute(professionalData))
      .rejects
      .toThrow("Health unit not found");
  });
});