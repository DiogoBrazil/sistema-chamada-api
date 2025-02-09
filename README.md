# Patient Call System API

This API is built with Node.js, Express, Prisma, PostgreSQL, Socket.IO, and Inversify (for dependency injection).  
It implements a layered architecture with controllers, use cases, repositories, and interfaces.  
The API provides functionality for managing professionals, patients, attendances (appointments), authentication (with JWT), reporting, and real-time communication via Socket.IO.

## Features

- **Professional Management:**  
  - Create professionals with validation (only "DOCTOR" or "RECEPTIONIST" allowed).  
  - List professionals.  
  - Get professional details.  
  - Login with JWT token generation.  
  - Set professional's office.

- **Patient Management:**  
  - Create patients.  
  - List patients.  
  - Get patient details.

- **Attendance Management:**  
  - Create an attendance (appointment).  
  - List current attendances (statuses: `PENDING` or `IN_PROGRESS`).  
  - Call a patient (set attendance status to `IN_PROGRESS` and emit a socket event).  
  - Finish an attendance (record professional, office, and finish time).  
  - Generate attendance reports based on a date/time interval.

- **Authentication:**  
  - Login returns a JWT token, along with user data (`fullName`, `cpf`, `profile`) and an expiration date.  
  - Set office information after login.

- **Real-Time Communication:**  
  - Socket.IO integration to notify a front-end (e.g., a call panel) when a patient is called.

## Folder Structure

```
backend/
├── package.json
├── tsconfig.json
├── .env
├── docker-compose.yml
├── prisma/
│   └── schema.prisma
└── src/
    ├── container.ts
    ├── types.ts
    ├── app.ts
    ├── server.ts
    ├── interfaces/
    │   ├── professional/
    │   │   └── ICreateProfessionalDTO.ts
    │   ├── patient/
    │   │   └── ICreatePatientDTO.ts
    │   └── attendance/
    │       └── IGetAttendanceReportDTO.ts
    ├── repositories/
    │   ├── ProfessionalRepository.ts
    │   ├── PatientRepository.ts
    │   └── AttendanceRepository.ts
    ├── useCases/
    │   ├── professional/
    │   │   ├── CreateProfessionalUseCase.ts
    │   │   ├── GetProfessionalsUseCase.ts
    │   │   ├── GetProfessionalByIdUseCase.ts
    │   │   ├── LoginProfessionalUseCase.ts
    │   │   └── SetOfficeUseCase.ts
    │   ├── patient/
    │   │   ├── CreatePatientUseCase.ts
    │   │   ├── GetPatientsUseCase.ts
    │   │   └── GetPatientByIdUseCase.ts
    │   └── attendance/
    │       ├── CreateAttendanceUseCase.ts
    │       ├── GetAttendancesUseCase.ts
    │       ├── CallPatientUseCase.ts
    │       ├── FinishAttendanceUseCase.ts
    │       └── GetAttendanceReportUseCase.ts
    ├── controllers/
    │   ├── ProfessionalController.ts
    │   ├── PatientController.ts
    │   ├── AttendanceController.ts
    │   ├── AuthController.ts
    │   └── ReportController.ts
    ├── routes/
    │   ├── professionalRoutes.ts
    │   ├── patientRoutes.ts
    │   ├── attendanceRoutes.ts
    │   ├── authRoutes.ts
    │   └── reportRoutes.ts
    └── sockets/
        └── index.ts
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
npx prisma migrate dev --name update_schema_english
npx prisma generate
```

### 5. Start PostgreSQL via Docker (Optional)

If using Docker, create a `docker-compose.yml` file with:

```yaml
services:
  db:
    image: postgres:13
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: mydb
    ports:
      - "5432:5432"
```

Then start it:

```bash
docker-compose up -d
```

### 6. Start the Server

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

## Endpoints

### Professionals

- **POST** `/api/professionals` - Create a new professional.
- **GET** `/api/professionals` - List all professionals.
- **GET** `/api/professionals/:id` - Get professional details by ID.

### Patients

- **POST** `/api/patients` - Create a new patient.
- **GET** `/api/patients` - List all patients.
- **GET** `/api/patients/:id` - Get patient details by ID.

### Attendances

- **POST** `/api/attendances` - Create a new attendance (appointment) for a patient.
- **GET** `/api/attendances` - List attendances with status `PENDING` or `IN_PROGRESS`.
- **POST** `/api/attendances/:id/call` - Mark an attendance as `IN_PROGRESS` and emit a socket event.
- **POST** `/api/attendances/:id/finish` - Finish an attendance.

### Authentication

- **POST** `/api/auth/login` - Login a professional.
- **POST** `/api/auth/set-office` - Set or update the professional's office.

### Reports

- **GET** `/api/reports/attendances/:professionalId/:startDate/:startTime/:endDate/:endTime`  
  Generate a report of finished attendances for a professional within a date/time interval.

## Socket.IO Integration

The API uses **Socket.IO** for real-time notifications.  
When an attendance is marked as "call" (using `/api/attendances/:id/call`), an event is emitted.

## TypeScript Configuration

The `tsconfig.json` is configured to support decorators (required by Inversify):

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Running the Application

Ensure your PostgreSQL database is running (via Docker or locally).  
Run the Prisma migrations:

```bash
npx prisma migrate dev --name update_schema_english
npx prisma generate
```

Start the server:

```bash
npm run dev
```

## License

MIT

## Author

🚀 **Desenvolvido por [DiogoBrazil](https://github.com/DiogoBrazil)**  