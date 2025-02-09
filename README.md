# Sistema de Chamada API

Esta é a API do Sistema de Chamada, construída com Node.js, Express, Prisma, PostgreSQL e Socket.IO.  
A API gerencia pacientes, profissionais, atendimentos e oferece funcionalidades de autenticação, real-time (via Socket.IO) e geração de relatórios.

## Features

- Cadastro e consulta de pacientes.
- Cadastro de profissionais com validação de perfil (somente "MEDICO" ou "RECEPCIONISTA") e senha criptografada com Argon2.
- Autenticação de profissionais.
- Atualização dinâmica do número do consultório (campo `currentConsultorio`) para profissionais com perfil "MEDICO".
- Fluxo de atendimentos:
  - Criação do atendimento (agendamento).
  - Chamada do paciente (altera status para `EM_ATENDIMENTO` e emite evento via Socket.IO).
  - Encerramento do atendimento (registra profissional, consultório e data/hora de encerramento).
- Relatórios de atendimentos finalizados com filtros por data e hora.
- Comunicação em tempo real via Socket.IO para atualização do painel de chamadas.

## Autor

[DiogoBrazil](https://github.com/DiogoBrazil)

## Requisitos

- Node.js (>=14)
- npm
- Docker (para rodar o PostgreSQL via Docker Compose)
- PostgreSQL (será provisionado via Docker)

## Instalação

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/DiogoBrazil/sistema-chamada-api.git
   cd sistema-chamada-api
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**

   Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo (ajuste conforme necessário):

   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mydb?schema=public"
   PORT=5000
   ```

4. **Configuração do Banco de Dados**

   O projeto utiliza o PostgreSQL, que pode ser executado via Docker Compose.

   Inicie o container do PostgreSQL:

   ```bash
   docker-compose up -d
   ```

   Execute as migrations e gere o client do Prisma:

   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Executando a Aplicação**

   Inicie o servidor em modo de desenvolvimento:

   ```bash
   npm run dev
   ```

   A API ficará disponível em `http://localhost:5000`.

## Endpoints da API

### Pacientes

- **POST** `/api/patients` - Cadastra um novo paciente.
- **GET** `/api/patients` - Lista todos os pacientes.
- **GET** `/api/patients/:id` - Retorna os detalhes de um paciente pelo ID.

### Profissionais

- **POST** `/api/professionals` - Cadastra um novo profissional.
  - O campo `profile` só aceita os valores `"MEDICO"` ou `"RECEPCIONISTA"`.
  - A senha (`password`) é criptografada com Argon2.
- **GET** `/api/professionals` - Lista todos os profissionais (removendo o campo `password` da resposta).
- **GET** `/api/professionals/:id` - Retorna os detalhes de um profissional pelo ID (sem o campo `password`).

### Autenticação

- **POST** `/api/auth/login` - Realiza o login do profissional.
  - Parâmetros: `cpf`, `password`.
- **POST** `/api/auth/set-consultorio` - Permite que o profissional (médico) informe ou atualize o consultório onde irá atender.

   ```json
   {
     "professionalId": 1,
     "consultorio": 2
   }
   ```

### Atendimentos

- **POST** `/api/atendimentos` - Agenda um atendimento para um paciente.
- **GET** `/api/atendimentos` - Lista os atendimentos com status `AGUARDANDO` ou `EM_ATENDIMENTO`.
- **POST** `/api/atendimentos/:id/chamar` - Altera o status do atendimento para `EM_ATENDIMENTO` e emite evento via Socket.IO para chamar o paciente.
- **POST** `/api/atendimentos/:id/encerrar` - Finaliza o atendimento.

   ```json
   {
     "professionalId": 1
   }
   ```

### Relatórios

- **GET** `/api/reports/atendimentos/:professionalId/:startDate/:startTime/:endDate/:endTime`  
  Retorna o relatório de atendimentos finalizados para um determinado profissional.

  **Exemplo de URL:**  
  `http://localhost:5000/api/reports/atendimentos/1/2025-02-01/08:00:00/2025-02-01/18:00:00`

## Comunicação em Tempo Real

A API utiliza **Socket.IO** para comunicação em tempo real.  
Quando um paciente é chamado (através do endpoint `/api/atendimentos/:id/chamar`), um evento `callPatient` é emitido.

## Docker Compose

Se precisar utilizar **Docker Compose** para o PostgreSQL, adicione um arquivo `docker-compose.yml`:

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

Inicie o container:

```bash
docker-compose up -d
```

## Estrutura do Projeto

```
sistema-chamada-api/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── controllers/
│   │   ├── atendimentoController.ts
│   │   ├── authController.ts
│   │   ├── patientController.ts
│   │   ├── professionalController.ts
│   │   └── reportController.ts
│   ├── routes/
│   │   ├── atendimentoRoutes.ts
│   │   ├── authRoutes.ts
│   │   ├── patientRoutes.ts
│   │   ├── professionalRoutes.ts
│   │   └── reportRoutes.ts
│   ├── sockets/
│   │   └── index.ts
│   ├── app.ts
│   └── server.ts
├── .env
├── docker-compose.yml
├── package.json
└── README.md
```

---

🚀 **Desenvolvido por [DiogoBrazil](https://github.com/DiogoBrazil)**  