import supertest from 'supertest';
import { app } from '../../../app';
import { setupTestDatabase, clearDatabase, closeDatabase } from '../../utils/testDatabase';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

describe('Professional API Endpoints', () => {
  let prisma: PrismaClient;
  let adminToken: string;
  let localAdminToken: string;
  
  beforeAll(async () => {
    prisma = setupTestDatabase();
    
    // Criar uma cidade para testes
    const city = await prisma.city.create({
      data: {
        id: 1,
        name: 'Test City',
        state: 'TS'
      }
    });
    
    // Criar uma unidade de saúde para testes
    const healthUnit = await prisma.healthUnit.create({
      data: {
        id: 1,
        name: 'Test Health Unit',
        active: true,
        cityId: city.id
      }
    });
    
    // Criar um administrador geral para autenticação
    const generalAdmin = await prisma.professional.create({
      data: {
        id: 1,
        fullName: 'General Admin',
        cpf: '12345678900',
        email: 'admin@example.com',
        password: 'password123',
        profile: 'GENERAL_ADMINISTRATOR',
        active: true,
        cityId: city.id
      }
    });
    
    // Criar um administrador local para autenticação
    const localAdmin = await prisma.professional.create({
      data: {
        id: 2,
        fullName: 'Local Admin',
        cpf: '98765432100',
        email: 'localadmin@example.com',
        password: 'password123',
        profile: 'LOCAL_ADMINISTRATOR',
        active: true,
        cityId: city.id
      }
    });
    
    // Vincular o administrador local à unidade de saúde
    await prisma.professionalHealthUnit.create({
      data: {
        professionalId: localAdmin.id,
        healthUnitId: healthUnit.id
      }
    });
    
    // Gerar tokens JWT para autenticação
    const secret = process.env.JWT_SECRET || 'test_secret';
    
    adminToken = jwt.sign(
      { 
        id: generalAdmin.id, 
        fullName: generalAdmin.fullName,
        cpf: generalAdmin.cpf,
        profile: generalAdmin.profile 
      },
      secret,
      { expiresIn: '1h' }
    );
    
    localAdminToken = jwt.sign(
      { 
        id: localAdmin.id, 
        fullName: localAdmin.fullName,
        cpf: localAdmin.cpf,
        profile: localAdmin.profile 
      },
      secret,
      { expiresIn: '1h' }
    );
  });
  
  beforeEach(async () => {
    await clearDatabase(prisma);
    
    // Recriar dados necessários após limpar o banco
    // Criar cidade
    await prisma.city.create({
      data: {
        id: 1,
        name: 'Test City',
        state: 'TS'
      }
    });
    
    // Criar unidade de saúde
    await prisma.healthUnit.create({
      data: {
        id: 1,
        name: 'Test Health Unit',
        active: true,
        cityId: 1
      }
    });
    
    // Recriar os administradores
    await prisma.professional.create({
      data: {
        id: 1,
        fullName: 'General Admin',
        cpf: '12345678900',
        email: 'admin@example.com',
        password: 'password123',
        profile: 'GENERAL_ADMINISTRATOR',
        active: true,
        cityId: 1
      }
    });
    
    const localAdmin = await prisma.professional.create({
      data: {
        id: 2,
        fullName: 'Local Admin',
        cpf: '98765432100',
        email: 'localadmin@example.com',
        password: 'password123',
        profile: 'LOCAL_ADMINISTRATOR',
        active: true,
        cityId: 1
      }
    });
    
    // Vincular o administrador local à unidade de saúde
    await prisma.professionalHealthUnit.create({
      data: {
        professionalId: localAdmin.id,
        healthUnitId: 1
      }
    });
  });
  
  afterAll(async () => {
    await closeDatabase(prisma);
  });
  
  describe('POST /api/professionals', () => {
    it('should create a new professional as general admin', async () => {
      // Arrange
      const newProfessional = {
        fullName: 'New Doctor',
        cpf: '11122233344',
        email: 'doctor@example.com',
        password: 'password123',
        profile: 'DOCTOR',
        active: true,
        cityId: 1,
        healthUnitId: 1
      };
      
      // Mock de API Key middleware
      app.use((req, res, next) => {
        req.headers['api-key'] = 'test-api-key';
        next();
      });
      
      // Act
      const response = await supertest(app)
        .post('/api/professionals')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProfessional);
      
      // Assert
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Professional created successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.fullName).toBe(newProfessional.fullName);
      expect(response.body.data.cpf).toBe(newProfessional.cpf);
      expect(response.body.data.email).toBe(newProfessional.email);
      
      // Verificar se o profissional foi realmente criado no banco
      const createdProfessional = await prisma.professional.findUnique({
        where: { email: newProfessional.email }
      });
      
      expect(createdProfessional).toBeTruthy();
      expect(createdProfessional?.fullName).toBe(newProfessional.fullName);
      
      // Verificar se foi vinculado à unidade de saúde
      const professionalHealthUnit = await prisma.professionalHealthUnit.findFirst({
        where: {
          professionalId: createdProfessional?.id,
          healthUnitId: newProfessional.healthUnitId
        }
      });
      
      expect(professionalHealthUnit).toBeTruthy();
    });
    
    it('should create a new professional as local admin', async () => {
      // Arrange
      const newProfessional = {
        fullName: 'New Nurse',
        cpf: '22233344455',
        email: 'nurse@example.com',
        password: 'password123',
        profile: 'NURSE',
        active: true,
        cityId: 1
      };
      
      // Act
      const response = await supertest(app)
        .post('/api/professionals')
        .set('Authorization', `Bearer ${localAdminToken}`)
        .send(newProfessional);
      
      // Assert
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Professional created and linked to health unit successfully');
      
      // Verificar se o profissional foi vinculado à mesma unidade do admin local
      const createdProfessional = await prisma.professional.findUnique({
        where: { email: newProfessional.email },
        include: { healthUnit: true }
      });
      
      expect(createdProfessional).toBeTruthy();
      expect(createdProfessional?.healthUnit).toHaveLength(1);
      expect(createdProfessional?.healthUnit[0].healthUnitId).toBe(1);
    });
    
    it('should return 403 if local admin tries to create another admin', async () => {
      // Arrange
      const newProfessional = {
        fullName: 'New Admin',
        cpf: '33344455566',
        email: 'newadmin@example.com',
        password: 'password123',
        profile: 'GENERAL_ADMINISTRATOR',
        active: true,
        cityId: 1
      };
      
      // Act
      const response = await supertest(app)
        .post('/api/professionals')
        .set('Authorization', `Bearer ${localAdminToken}`)
        .send(newProfessional);
      
      // Assert
      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Local administrators cannot create administrator profiles');
    });
  });
  
  describe('GET /api/professionals/:id', () => {
    it('should get a professional by ID', async () => {
      // Arrange - Criar um profissional para buscar
      const professional = await prisma.professional.create({
        data: {
          fullName: 'Get By ID Test',
          cpf: '55566677788',
          email: 'gettest@example.com',
          password: 'password123',
          profile: 'DOCTOR',
          active: true,
          cityId: 1
        }
      });
      
      // Act
      const response = await supertest(app)
        .get(`/api/professionals/${professional.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('id', professional.id);
      expect(response.body.data.fullName).toBe(professional.fullName);
      expect(response.body.data.cpf).toBe(professional.cpf);
      expect(response.body.data.email).toBe(professional.email);
    });
    
    it('should return 404 if professional not found', async () => {
      // Act
      const response = await supertest(app)
        .get('/api/professionals/9999')
        .set('Authorization', `Bearer ${adminToken}`);
      
      // Assert
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Professional not found');
    });
  });
  
  describe('GET /api/professionals/cpf/:cpf', () => {
    it('should get a professional by CPF', async () => {
      // Arrange
      const professional = await prisma.professional.create({
        data: {
          fullName: 'CPF Test Professional',
          cpf: '99988877766',
          email: 'cpftest@example.com',
          password: 'password123',
          profile: 'NURSE',
          active: true,
          cityId: 1
        }
      });
      
      // Act
      const response = await supertest(app)
        .get(`/api/professionals/cpf/${professional.cpf}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.cpf).toBe(professional.cpf);
      expect(response.body.data.fullName).toBe(professional.fullName);
    });
  });
  
  describe('GET /api/professionals/page/:page', () => {
    it('should get professionals with pagination', async () => {
      // Arrange - Criar vários profissionais
      const professionals = [];
      for (let i = 1; i <= 7; i++) {
        professionals.push({
          fullName: `Paginated Professional ${i}`,
          cpf: `1111111111${i}`,
          email: `paginated${i}@example.com`,
          password: 'password123',
          profile: i % 2 === 0 ? 'NURSE' : 'DOCTOR',
          active: true,
          cityId: 1
        });
      }
      
      await prisma.professional.createMany({
        data: professionals
      });
      
      // Act
      const response = await supertest(app)
        .get('/api/professionals/page/1')
        .set('Authorization', `Bearer ${adminToken}`);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.pagination).toHaveProperty('currentPage', 1);
      expect(response.body.pagination).toHaveProperty('totalPages');
      expect(response.body.pagination).toHaveProperty('totalItems');
    });
  });
});