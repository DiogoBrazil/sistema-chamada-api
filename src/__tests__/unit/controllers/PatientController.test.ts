import { PatientController } from '../../../controllers/PatientController';
import { Request, Response, NextFunction } from 'express';
import { container } from '../../../container';
import { TYPES } from '../../../types';
import { CreatePatientUseCase } from '../../../useCases/patient/CreatePatientUseCase';
import { GetPatientByIdUseCase } from '../../../useCases/patient/GetPatientByIdUseCase';
import { GetPatientsUseCase } from '../../../useCases/patient/GetPatientsUseCase';
import { GetPatientByCpfUseCase } from '../../../useCases/patient/GetPatientByCpfUseCase';

// Mock container 
jest.mock('../../../container', () => ({
  container: {
    get: jest.fn()
  }
}));

describe('PatientController', () => {
  let patientController: PatientController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.MockedFunction<NextFunction>;
  
  beforeEach(() => {
    patientController = new PatientController();
    
    req = {
      params: {},
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
    
    jest.clearAllMocks();
  });
  
  describe('create', () => {
    it('should create a patient successfully', async () => {
      // Arrange
      const createPatientUseCaseMock = {
        execute: jest.fn().mockResolvedValue({
          id: 1,
          fullName: 'Test Patient',
          socialName: 'Test',
          cpf: '12345678900'
        })
      };
      
      (container.get as jest.Mock).mockReturnValue(createPatientUseCaseMock);
      
      req.body = {
        fullName: 'Test Patient',
        socialName: 'Test',
        cpf: '12345678900',
        birthDate: '2000-01-01'
      };
      
      // Act
      await patientController.create(req as Request, res as Response, next);
      
      // Assert
      expect(container.get).toHaveBeenCalledWith(TYPES.CreatePatientUseCase);
      expect(createPatientUseCaseMock.execute).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Patient created successfully",
        data: {
          id: 1,
          fullName: 'Test Patient',
          socialName: 'Test',
          cpf: '12345678900'
        },
        status_code: 201
      });
    });
    
    it('should pass errors to next middleware', async () => {
      // Arrange
      const error = new Error('Test error');
      const createPatientUseCaseMock = {
        execute: jest.fn().mockRejectedValue(error)
      };
      
      (container.get as jest.Mock).mockReturnValue(createPatientUseCaseMock);
      
      req.body = {
        fullName: 'Test Patient',
        socialName: 'Test',
        cpf: '12345678900',
        birthDate: '2000-01-01'
      };
      
      // Act
      await patientController.create(req as Request, res as Response, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  describe('getById', () => {
    it('should get a patient by ID successfully', async () => {
      // Arrange
      const patient = {
        id: 1,
        fullName: 'Test Patient',
        socialName: 'Test',
        cpf: '12345678900'
      };
      
      const getPatientByIdUseCaseMock = {
        execute: jest.fn().mockResolvedValue(patient)
      };
      
      (container.get as jest.Mock).mockReturnValue(getPatientByIdUseCaseMock);
      
      req.params = { id: '1' };
      
      // Act
      await patientController.getById(req as Request, res as Response, next);
      
      // Assert
      expect(container.get).toHaveBeenCalledWith(TYPES.GetPatientByIdUseCase);
      expect(getPatientByIdUseCaseMock.execute).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Patient retrieved successfully",
        data: patient,
        status_code: 200
      });
    });
    
    it('should return 404 if patient is not found', async () => {
      // Arrange
      const getPatientByIdUseCaseMock = {
        execute: jest.fn().mockResolvedValue(null)
      };
      
      (container.get as jest.Mock).mockReturnValue(getPatientByIdUseCaseMock);
      
      req.params = { id: '999' };
      
      // Act
      await patientController.getById(req as Request, res as Response, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Patient not found",
        data: null,
        status_code: 404
      });
    });
  });
  
  describe('getByCpf', () => {
    it('should get a patient by CPF successfully', async () => {
      // Arrange
      const patient = {
        id: 1,
        fullName: 'Test Patient',
        socialName: 'Test',
        cpf: '12345678900'
      };
      
      const getPatientByCpfUseCaseMock = {
        execute: jest.fn().mockResolvedValue(patient)
      };
      
      (container.get as jest.Mock).mockReturnValue(getPatientByCpfUseCaseMock);
      
      req.params = { cpf: '12345678900' };
      
      // Act
      await patientController.getByCpf(req as Request, res as Response, next);
      
      // Assert
      expect(container.get).toHaveBeenCalledWith(TYPES.GetPatientByCpfUseCase);
      expect(getPatientByCpfUseCaseMock.execute).toHaveBeenCalledWith('12345678900');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Patient retrieved successfully",
        data: patient,
        status_code: 200
      });
    });
    
    it('should return 404 if patient is not found by CPF', async () => {
      // Arrange
      const getPatientByCpfUseCaseMock = {
        execute: jest.fn().mockResolvedValue(null)
      };
      
      (container.get as jest.Mock).mockReturnValue(getPatientByCpfUseCaseMock);
      
      req.params = { cpf: '99988877766' };
      
      // Act
      await patientController.getByCpf(req as Request, res as Response, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ 
        error: "Patient not found"
      });
    });
  });
  
  describe('getAll', () => {
    it('should get all patients with pagination', async () => {
      // Arrange
      const paginatedResult = {
        data: [
          {
            id: 1,
            fullName: 'Patient 1',
            socialName: 'P1',
            cpf: '11122233344'
          },
          {
            id: 2,
            fullName: 'Patient 2',
            socialName: 'P2',
            cpf: '55566677788'
          }
        ],
        currentPage: 1,
        totalPages: 2,
        totalItems: 10
      };
      
      const getPatientsUseCaseMock = {
        execute: jest.fn().mockResolvedValue(paginatedResult)
      };
      
      (container.get as jest.Mock).mockReturnValue(getPatientsUseCaseMock);
      
      req.params = { page: '1' };
      
      // Act
      await patientController.getAll(req as Request, res as Response, next);
      
      // Assert
      expect(container.get).toHaveBeenCalledWith(TYPES.GetPatientsUseCase);
      expect(getPatientsUseCaseMock.execute).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Patients retrieved successfully",
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