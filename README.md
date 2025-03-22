# Patient Call System API

This API is built with Node.js, Express, Prisma, PostgreSQL, Socket.IO, and Inversify (for dependency injection).  
It implements a layered architecture with controllers, use cases, repositories, and interfaces.  
The API provides functionality for managing professionals, patients, attendances (appointments), authentication (with JWT), reporting, and real-time communication via Socket.IO, with support for multiple cities and health units.

## Features

- **Hierarchical Administrative Management:**
  - Three administrative levels: General Administrator, General Local Administrator (city-level), and Local Administrator (health unit-level)
  - Permissions control based on administrative hierarchy
  - Role-based access control with different permissions for each profile

- **City Management:**
  - Create and manage cities
  - View attendance reports by city

- **Health Unit Management:**
  - Create health units within cities
  - Assign professionals to health units
  - Track patient flow through health units

- **Professional Management:**  
  - Create professionals with multiple profiles (GENERAL_ADMINISTRATOR, GENERAL_LOCAL_ADMINISTRATOR, LOCAL_ADMINISTRATOR, DOCTOR, NURSE, NURSING_TECHNICIAN, RECEPTIONIST, ODONTOLOGIST, ACS)
  - Each professional is associated with a city and optionally with health units
  - Login with JWT token generation
  - Set professional's office and attendance mode
  - Address management for professionals

- **Patient Management:**  
  - Create patients with address information
  - Search patients by name or CPF
  - Patient address management
  - View patient history

- **Attendance Management:**  
  - Create attendances (appointments) in different stages (TRIAGE, VACCINE, MEDICAL_CONSULTATION, NURSING_CONSULTATION, DENTAL_CONSULTATION)
  - Track attendance status (PENDING, IN_PROGRESS, FINISHED)
  - Call patients (set attendance status to IN_PROGRESS and emit a socket event)
  - Forward patients between stages
  - Finish attendances
  - Generate attendance reports by professional, date/time interval, health unit, or city

- **CID (Disease Classification) Management:**
  - Create, update and search disease codes (CID)
  - Associate CID codes with patient attendances

- **Authentication and Authorization:**
  - Login returns a JWT token, along with user data and an expiration date
  - Middleware for authentication and permission verification
  - Hierarchical access control based on administrative level

- **Real-Time Communication:**  
  - Socket.IO integration to notify a front-end (e.g., a call panel) when a patient is called

- **Standardized API Responses:**
  - Consistent response format with message, data, and status code
  - Standardized error handling with appropriate HTTP status codes

## System Architecture

The system follows a hierarchical structure:

- Cities contain multiple health units
- Each city can have one General Local Administrator
- Each health unit can have one Local Administrator
- Professionals are associated with cities and may be linked to health units
- General Administrators have system-wide access
- General Local Administrators have access limited to their city
- Local Administrators have access limited to their health unit(s)

## Administrative Profiles

1. **GENERAL_ADMINISTRATOR:**
   - Global access to the entire system
   - Can manage all professionals (except other GENERAL_ADMINISTRATORs)
   - Can manage all cities and health units

2. **GENERAL_LOCAL_ADMINISTRATOR:**
   - Associated with a specific city
   - Can manage professionals within their city
   - Can create LOCAL_ADMINISTRATORs for health units in their city

3. **LOCAL_ADMINISTRATOR:**
   - Associated with a specific health unit
   - Can manage non-administrative professionals in their health unit
   - Limited to operations within their health unit

4. Other professional profiles include: DOCTOR, NURSE, NURSING_TECHNICIAN, RECEPTIONIST, ODONTOLOGIST, and ACS

## Folder Structure

```
/
├── package.json
├── tsconfig.json
├── .env
├── docker-compose.yml
├── prisma/
│   ├── migrations/
│   └── schema.prisma
└── src/
    ├── adapters/             # Password encryption and token generation
    ├── constants/            # Constants like profile types
    ├── container.ts          # Dependency injection container
    ├── types.ts              # Type definitions
    ├── app.ts
    ├── server.ts
    ├── interfaces/           # DTOs and interfaces
    │   ├── DecodedToken.ts
    │   ├── message/          # API response interfaces
    │   ├── address/
    │   ├── attendance/
    │   ├── cid/
    │   ├── city/
    │   ├── healthUnit/
    │   ├── patient/
    │   ├── professional/
    │   └── report/
    ├── middleware/           # Authentication and authorization middleware
    │   ├── apiKeyMiddleware.ts
    │   ├── authMiddleware.ts
    │   ├── authorizationMiddleware.ts
    │   └── roleMiddleware.ts
    ├── repositories/         # Data access layer
    │   ├── AttendanceRepository.ts
    │   ├── CidRepository.ts
    │   ├── CityRepository.ts
    │   ├── HealthUnitAddressRepository.ts
    │   ├── HealthUnitRepository.ts
    │   ├── PatientAddressRepository.ts
    │   ├── PatientRepository.ts
    │   ├── ProfessionalAddressRepository.ts
    │   └── ProfessionalRepository.ts
    ├── useCases/             # Business logic
    │   ├── address/
    │   ├── attendance/
    │   ├── cid/
    │   ├── city/
    │   ├── healthUnit/
    │   ├── patient/
    │   ├── professional/
    │   └── reports/
    ├── controllers/          # Request handlers
    │   ├── AttendanceController.ts
    │   ├── AuthController.ts
    │   ├── CidController.ts
    │   ├── CityController.ts
    │   ├── HealthUnitController.ts
    │   ├── PatientAddressController.ts
    │   ├── PatientController.ts
    │   ├── ProfessionalAddressController.ts
    │   ├── ProfessionalController.ts
    │   └── ReportController.ts
    ├── routes/               # API routes
    │   ├── attendanceRoutes.ts
    │   ├── authRoutes.ts
    │   ├── cidRoutes.ts
    │   ├── cityRoutes.ts
    │   ├── healthUnitRoutes.ts
    │   ├── patientAddressRoutes.ts
    │   ├── patientRoutes.ts
    │   ├── professionalAddressRoutes.ts
    │   ├── professionalRoutes.ts
    │   └── reportRoutes.ts
    ├── sockets/              # Socket.IO connection
    │   └── index.ts
    └── utils/                # Utility functions
        ├── cpfValidator.ts
        ├── emailValidator.ts
        ├── errors.ts
        └── response.ts
```

## Requirements

- **Node.js** (>=14)
- **npm**
- **Docker** (for running PostgreSQL via Docker Compose) or a local PostgreSQL installation
- Environment variables: `DATABASE_URL`, `JWT_SECRET`, `PORT`

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/DiogoBrazil/sistema-chamada-api.git
cd sistema-chamada-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root with content similar to:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mydb?schema=public"
JWT_SECRET=your_very_secret_key
PORT=5000
```

### 4. Database Setup with Prisma

Run the migrations and generate the Prisma client:

```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Start PostgreSQL via Docker

```bash
docker-compose up -d
```

### 6. Start the Server

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

## Key Endpoints

### Authentication
- **POST** `/api/auth/login` - Login a professional
- **POST** `/api/auth/set-office` - Set professional's office
- **POST** `/api/auth/set-attendance-mode` - Set professional's attendance mode

### Cities
- **POST** `/api/city` - Create a new city
- **GET** `/api/city/page/:page` - List cities with pagination
- **GET** `/api/city/:id` - Get city details by ID
- **GET** `/api/city/search/:term` - Search cities by term
- **PUT** `/api/city/:id` - Update a city
- **DELETE** `/api/city/:id` - Delete a city

### Health Units
- **POST** `/api/health-units` - Create a new health unit
- **GET** `/api/health-units/page/:page` - List health units with pagination
- **GET** `/api/health-units/:id` - Get health unit details by ID
- **PUT** `/api/health-units/:id` - Update a health unit
- **DELETE** `/api/health-units/:id` - Delete a health unit
- **POST** `/api/health-units/:id/professionals` - Add a professional to a health unit
- **DELETE** `/api/health-units/:id/professionals/:professionalId` - Remove a professional from a health unit

### Professionals
- **POST** `/api/professionals` - Create a new professional
- **GET** `/api/professionals/page/:page` - List professionals with pagination
- **GET** `/api/professionals/:id` - Get professional details by ID
- **GET** `/api/professionals/cpf/:cpf` - Get professional by CPF
- **GET** `/api/professionals/name/:name` - Search professionals by name
- **PUT** `/api/professionals/:id` - Update a professional
- **DELETE** `/api/professionals/:id` - Delete a professional

### Professional Addresses
- **POST** `/api/professionals/:professionalId/addresses` - Add address to a professional
- **GET** `/api/professionals/:professionalId/addresses` - Get all addresses for a professional
- **PUT** `/api/professionals/addresses/:addressId` - Update a professional's address
- **DELETE** `/api/professionals/addresses/:addressId` - Delete a professional's address

### Patients
- **POST** `/api/patients` - Create a new patient
- **GET** `/api/patients/page/:page` - List patients with pagination
- **GET** `/api/patients/:id` - Get patient details by ID
- **GET** `/api/patients/cpf/:cpf` - Get patient by CPF
- **GET** `/api/patients/name/:name` - Search patients by name
- **PUT** `/api/patients/:id` - Update a patient
- **DELETE** `/api/patients/:id` - Delete a patient

### Patient Addresses
- **POST** `/api/patients/:patientId/addresses` - Add address to a patient
- **GET** `/api/patients/:patientId/addresses` - Get all addresses for a patient
- **PUT** `/api/patients/addresses/:addressId` - Update a patient's address
- **DELETE** `/api/patients/addresses/:addressId` - Delete a patient's address

### CID (Disease Classification)
- **POST** `/api/cid` - Create a new CID
- **GET** `/api/cid/page/:page` - List CIDs with pagination
- **GET** `/api/cid/search/:term` - Search CIDs by code or description
- **PUT** `/api/cid/:id` - Update a CID
- **DELETE** `/api/cid/:id` - Delete a CID

### Attendances
- **POST** `/api/attendances` - Create a new attendance
- **GET** `/api/attendances` - List all current attendances
- **GET** `/api/attendances/triage` - List triage attendances
- **GET** `/api/attendances/medical` - List medical consultation attendances
- **GET** `/api/attendances/nursing` - List nursing consultation attendances
- **GET** `/api/attendances/dental` - List dental consultation attendances
- **GET** `/api/attendances/vaccine` - List vaccine attendances
- **POST** `/api/attendances/:id/call` - Call a patient
- **POST** `/api/attendances/:id/forward` - Forward a patient to another stage
- **POST** `/api/attendances/:id/finish` - Finish an attendance

### Reports
- **GET** `/api/reports/attendances/:professionalId/:startDate/:startTime/:endDate/:endTime` - Generate attendance report by professional
- **GET** `/api/reports/health-unit/:healthUnitId/:startDate/:startTime/:endDate/:endTime` - Generate health unit report
- **GET** `/api/reports/city/:cityId/:startDate/:startTime/:endDate/:endTime` - Generate city report

## API Response Format

All API responses follow a standardized format:

```json
{
  "message": "Descriptive message",
  "data": <object or array of data or null>,
  "status_code": <HTTP status code>
}
```

For paginated responses:

```json
{
  "message": "Data retrieved successfully",
  "data": <array of items>,
  "pagination": {
    "currentPage": <current page number>,
    "totalPages": <total number of pages>,
    "totalItems": <total number of items>
  },
  "status_code": 200
}
```

## Socket.IO Integration

The API uses Socket.IO for real-time notifications.  
When an attendance is marked as "call" (using `/api/attendances/:id/call`), an event is emitted with patient information.

## License

MIT

## Author

🚀 **Desenvolvido por [DiogoBrazil](https://github.com/DiogoBrazil)**  