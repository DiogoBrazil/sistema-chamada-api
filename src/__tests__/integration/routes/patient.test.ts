import supertest from 'supertest';
import { app } from '../../../app';
import { setupTestDatabase, clearDatabase, closeDatabase } from '../../utils/testDatabase';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

describe('Patient API Endpoints', () => {
  let prisma: PrismaClient;
  let authToken: string;
  
  beforeAll(async () => {
    prisma = setupTestDatabase();
    
    // Criar um profissional para autenticação
    const professional = await prisma.professional.create({
      data: {
        id: 1,
        fullName: 'Test Professional',
        cpf: '12345678900',
        email: 'test@example.com',
        password: 'password123',
        profile: 'GENERAL_ADMINISTRATOR',
        registrationNumber: 'TEST123',
        phone: '1234567890',
        active: true
      }
    });
    
    // Gerar token JWT para autenticação
    const secret = process.env.JWT_SECRET || 'test_secret';
    authToken = jwt.sign(
      { 
        id: professional.id, 
        fullName: professional.fullName,
        cpf: professional.cpf,
        profile: professional.profile 
      },
      secret,
      { expiresIn: '1h' }
    );
  });
  
  beforeEach(async () => {
    await clearDatabase(prisma);
    
    // Recriar o profissional após limpar o banco
    await prisma.professional.create({
      data: {
        id: 1,
        fullName: 'Test Professional',
        cpf: '12345678900',
        email: 'test@example.com',
        password: 'password123',
        profile: 'GENERAL_ADMINISTRATOR',
        registrationNumber: 'TEST123',
        phone: '1234567890',
        active: true
      }
    });
  });
  
  afterAll(async () => {
    await closeDatabase(prisma);
  });
  
  describe('POST /api/patients', () => {
    it('should create a new patient', async () => {
      // Arrange
      const newPatient = {
        fullName: 'John Doe',
        socialName: 'John',
        cpf: '98765432100',
        birthDate: '1990-01-01',
        phone: '9876543210',
        sex: 'M',
        race: 'BRANCO'
      };
      
      // Mock de API Key middleware
      app.use((req, res, next) => {
        req.headers['api-key'] = 'test-api-key';
        next();
      });
      
      // Act
      const response = await supertest(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPatient);
      
      // Assert
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Patient created successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.fullName).toBe(newPatient.fullName);
      expect(response.body.data.cpf).toBe(newPatient.cpf);
      
      // Verificar se o paciente foi realmente criado no banco
      const createdPatient = await prisma.patient.findUnique({
        where: { cpf: newPatient.cpf }
      });
      
      expect(createdPatient).toBeTruthy();
      expect(createdPatient?.fullName).toBe(newPatient.fullName);
    });
    
    it('should create a patient with address', async () => {
      // Arrange
      const newPatient = {
        fullName: 'Maria Silva',
        socialName: 'Maria',
        cpf: '11122233344',
        birthDate: '1985-05-15',
        phone: '1122334455',
        sex: 'F',
        race: 'PARDO',
        address: {
          street: 'Rua das Flores',
          number: '123',
          complement: 'Apto 101',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
          isMain: true
        }
      };
      
      // Act
      const response = await supertest(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPatient);
      
      // Assert
      expect(response.status).toBe(201);
      
      // Verificar se o endereço foi criado
      const createdPatient = await prisma.patient.findUnique({
        where: { cpf: newPatient.cpf },
        include: { addresses: true }
      });
      
      expect(createdPatient).toBeTruthy();
      expect(createdPatient?.addresses).toHaveLength(1);
      expect(createdPatient?.addresses[0].street).toBe(newPatient.address.street);
    });
  });
  
  describe('GET /api/patients/:id', () => {
    it('should get a patient by ID', async () => {
      // Arrange - Criar um paciente para buscar
      const patient = await prisma.patient.create({
        data: {
          fullName: 'Get By ID Test',
          socialName: 'GetTest',
          cpf: '55566677788',
          birthDate: new Date('1975-10-20'),
          phone: '5566778899',
          sex: 'M',
          race: 'BRANCO'
        }
      });
      
      // Act
      const response = await supertest(app)
        .get(`/api/patients/${patient.id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('id', patient.id);
      expect(response.body.data.fullName).toBe(patient.fullName);
      expect(response.body.data.cpf).toBe(patient.cpf);
    });
    
    it('should return 404 if patient not found', async () => {
      // Act
      const response = await supertest(app)
        .get('/api/patients/9999')
        .set('Authorization', `Bearer ${authToken}`);
      
      // Assert
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Patient not found');
    });
  });
  
  describe('GET /api/patients/cpf/:cpf', () => {
    it('should get a patient by CPF', async () => {
      // Arrange
      const patient = await prisma.patient.create({
        data: {
          fullName: 'CPF Test Patient',
          socialName: 'CPF Test',
          cpf: '99988877766',
          birthDate: new Date('1980-03-15'),
          phone: '9988776655',
          sex: 'F',
          race: 'NEGRO'
        }
      });
      
      // Act
      const response = await supertest(app)
        .get(`/api/patients/cpf/${patient.cpf}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.cpf).toBe(patient.cpf);
      expect(response.body.data.fullName).toBe(patient.fullName);
    });
  });
  
  // Teste de paginação
  describe('GET /api/patients/page/:page', () => {
    it('should get patients with pagination', async () => {
      // Arrange - Criar vários pacientes
      const patients = [];
      for (let i = 1; i <= 7; i++) {
        patients.push({
          fullName: `Paginated Patient ${i}`,
          socialName: `Patient ${i}`,
          cpf: `1111111111${i}`,
          birthDate: new Date('1990-01-01'),
          phone: `1111111111${i}`,
          sex: i % 2 === 0 ? 'F' : 'M',
          race: 'BRANCO'
        });
      }
      
      await prisma.patient.createMany({
        data: patients
      });
      
      // Act
      const response = await supertest(app)
        .get('/api/patients/page/1')
        .set('Authorization', `Bearer ${authToken}`);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.pagination).toHaveProperty('currentPage', 1);
      expect(response.body.pagination).toHaveProperty('totalPages');
      expect(response.body.pagination).toHaveProperty('totalItems');
    });
  });
});