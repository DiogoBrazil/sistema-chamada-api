import { ProfessionalController } from '../../../controllers/ProfessionalController';
import { Request, Response, NextFunction } from 'express';
import { container } from '../../../container';
import { TYPES } from '../../../types';
import { CreateProfessionalByGeneralAdminUseCase } from '../../../useCases/professional/CreateProfessionalByGeneralAdminUseCase';
import { CreateProfessionalByLocalAdminUseCase } from '../../../useCases/professional/CreateProfessionalByLocalAdminUseCase';
import { GetProfessionalByCpfUseCase } from '../../../useCases/professional/GetProfessionalByCpfUseCase';
import { GetProfessionalByIdUseCase } from '../../../useCases/professional/GetProfessionalByIdUseCase';
import { GetProfessionalsUseCase } from '../../../useCases/professional/GetProfessionalsUseCase';

// Mock container
jest.mock('../../../container', () => ({
  container: {
    get: jest.fn()
  }
}));

describe('ProfessionalController', () => {
  let professionalController: ProfessionalController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.MockedFunction<NextFunction>;
  
  beforeEach(() => {
    professionalController = new ProfessionalController();
    
    req = {
      params: {},
      body: {},
      user: { id: 1, profile: 'GENERAL_ADMINISTRATOR' }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
    
    jest.clearAllMocks();
  });
  
  describe('create', () => {
    it('should create a professional as GENERAL_ADMINISTRATOR', async () => {
      // Arrange
      const createProfessionalMock = {
        execute: jest.fn().mockResolvedValue({
          id: 1,
          fullName: 'New Professional',
          cpf: '12345678900',
          email: 'new@example.com',
          profile: 'DOCTOR'
        })
      };
      
      (container.get as jest.Mock).mockReturnValue(createProfessionalMock);
      
      req.body = {
        fullName: 'New Professional',
        cpf: '12345678900',
        email: 'new@example.com',
        password: 'password123',
        profile: 'DOCTOR',
        active: true,
        cityId: 1,
        healthUnitId: 1
      };
      
      // Act
      await professionalController.create(req as Request, res as Response, next);
      
      // Assert
      expect(container.get).toHaveBeenCalledWith(TYPES.CreateProfessionalByGeneralAdminUseCase);
      expect(createProfessionalMock.execute).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Professional created successfully",
        data: {
          id: 1,
          fullName: 'New Professional',
          cpf: '12345678900',
          email: 'new@example.com',
          profile: 'DOCTOR'
        },
        status_code: 201
      });
    });
    
    it('should create a professional as LOCAL_ADMINISTRATOR', async () => {
      // Arrange
      const createProfessionalMock = {
        execute: jest.fn().mockResolvedValue({
          id: 1,
          fullName: 'New Professional',
          cpf: '12345678900',
          email: 'new@example.com',
          profile: 'DOCTOR'
        })
      };
      
      (container.get as jest.Mock).mockReturnValue(createProfessionalMock);
      
      req.user = { id: 2, profile: 'LOCAL_ADMINISTRATOR' };
      
      req.body = {
        fullName: 'New Professional',
        cpf: '12345678900',
        email: 'new@example.com',
        password: 'password123',
        profile: 'DOCTOR',
        active: true,
        cityId: 1
      };
      
      // Act
      await professionalController.create(req as Request, res as Response, next);
      
      // Assert
      expect(container.get).toHaveBeenCalledWith(TYPES.CreateProfessionalByLocalAdminUseCase);
      expect(createProfessionalMock.execute).toHaveBeenCalledWith(2, req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Professional created and linked to health unit successfully",
        data: {
          id: 1,
          fullName: 'New Professional',
          cpf: '12345678900',
          email: 'new@example.com',
          profile: 'DOCTOR'
        },
        status_code: 201
      });
    });
    
    it('should return 403 if user is not an administrator', async () => {
      // Arrange
      req.user = { id: 3, profile: 'DOCTOR' };
      
      // Act
      await professionalController.create(req as Request, res as Response, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Only administrators can create professionals",
        data: null,
        status_code: 403
      });
    });
    
    it('should handle error when local admin creates invalid professional', async () => {
      // Arrange
      const error = new Error('Local administrators cannot create administrator profiles');
      const createProfessionalMock = {
        execute: jest.fn().mockRejectedValue(error)
      };
      
      (container.get as jest.Mock).mockReturnValue(createProfessionalMock);
      
      req.user = { id: 2, profile: 'LOCAL_ADMINISTRATOR' };
      req.body = {
        fullName: 'New Admin',
        cpf: '12345678900',
        email: 'new@example.com',
        password: 'password123',
        profile: 'GENERAL_ADMINISTRATOR',
        active: true,
        cityId: 1
      };
      
      // Act
      await professionalController.create(req as Request, res as Response, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Local administrators cannot create administrator profiles",
        data: null,
        status_code: 403
      });
    });
  });
  
  describe('getById', () => {
    it('should get a professional by ID successfully', async () => {
      // Arrange
      const professional = {
        id: 1,
        fullName: 'Test Professional',
        cpf: '12345678900',
        email: 'test@example.com',
        profile: 'DOCTOR'
      };
      
      const getProfessionalByIdUseCaseMock = {
        execute: jest.fn().mockResolvedValue(professional)
      };
      
      (container.get as jest.Mock).mockReturnValue(getProfessionalByIdUseCaseMock);
      
      req.params = { id: '1' };
      
      // Act
      await professionalController.getById(req as Request, res as Response, next);
      
      // Assert
      expect(container.get).toHaveBeenCalledWith(TYPES.GetProfessionalByIdUseCase);
      expect(getProfessionalByIdUseCaseMock.execute).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Professional retrieved successfully",
        data: professional,
        status_code: 200
      });
    });
    
    it('should return 404 if professional is not found', async () => {
      // Arrange
      const getProfessionalByIdUseCaseMock = {
        execute: jest.fn().mockResolvedValue(null)
      };
      
      (container.get as jest.Mock).mockReturnValue(getProfessionalByIdUseCaseMock);
      
      req.params = { id: '999' };
      
      // Act
      await professionalController.getById(req as Request, res as Response, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Professional not found",
        data: null,
        status_code: 404
      });
    });
  });
  
  describe('getByCpf', () => {
    it('should get a professional by CPF successfully', async () => {
      // Arrange
      const professional = {
        id: 1,
        fullName: 'Test Professional',
        cpf: '12345678900',
        email: 'test@example.com',
        profile: 'DOCTOR'
      };
      
      const getProfessionalByCpfUseCaseMock = {
        execute: jest.fn().mockResolvedValue(professional)
      };
      
      (container.get as jest.Mock).mockReturnValue(getProfessionalByCpfUseCaseMock);
      
      req.params = { cpf: '12345678900' };
      
      // Act
      await professionalController.getByCpf(req as Request, res as Response, next);
      
      // Assert
      expect(container.get).toHaveBeenCalledWith(TYPES.GetProfessionalByCpfUseCase);
      expect(getProfessionalByCpfUseCaseMock.execute).toHaveBeenCalledWith('12345678900');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Professional retrieved successfully",
        data: professional,
        status_code: 200
      });
    });
    
    it('should return 404 if professional is not found by CPF', async () => {
      // Arrange
      const getProfessionalByCpfUseCaseMock = {
        execute: jest.fn().mockResolvedValue(null)
      };
      
      (container.get as jest.Mock).mockReturnValue(getProfessionalByCpfUseCaseMock);
      
      req.params = { cpf: '99988877766' };
      
      // Act
      await professionalController.getByCpf(req as Request, res as Response, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Professional not found",
        data: null,
        status_code: 404
      });
    });
  });
  
  describe('getAll', () => {
    it('should get all professionals with pagination', async () => {
      // Arrange
      const paginatedResult = {
        data: [
          {
            id: 1,
            fullName: 'Professional 1',
            cpf: '11122233344',
            profile: 'DOCTOR'
          },
          {
            id: 2,
            fullName: 'Professional 2',
            cpf: '55566677788',
            profile: 'NURSE'
          }
        ],
        currentPage: 1,
        totalPages: 2,
        totalItems: 10
      };
      
      const getProfessionalsUseCaseMock = {
        execute: jest.fn().mockResolvedValue(paginatedResult)
      };
      
      (container.get as jest.Mock).mockReturnValue(getProfessionalsUseCaseMock);
      
      req.params = { page: '1' };
      
      // Act
      await professionalController.getAll(req as Request, res as Response, next);
      
      // Assert
      expect(container.get).toHaveBeenCalledWith(TYPES.GetProfessionalsUseCase);
      expect(getProfessionalsUseCaseMock.execute).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Professionals retrieved successfully",
        data: paginatedResult.data,
        pagination: {
          currentPage: 1,
          totalPages: 2,
          totalItems: 10
        },
        status_code: 200
      });
    });
  });
});