import { execSync } from "child_process"

import { afterAll, beforeAll, beforeEach } from "@jest/globals"

import { DbContainer } from "./test/helpers/DbContainer"
import { config } from "./test/utils/config"
import { container } from "./src/container"
import { InitializeAdminUseCase } from "./src/useCases/professional/InitializeAdminUseCase"
import { TYPES } from "./src/types"
import { PrismaClient } from "@prisma/client"

const dbContainer = DbContainer.getInstance()

// Before all
beforeAll(async () => {
    await dbContainer.start()
    const databaseUrl = dbContainer.getConnectionUrl()
    await migrate(databaseUrl)
    await generate()
    setEnvs()
}, 30000)

async function migrate(databaseUrl: string) {
    try {
        execSync(`export DATABASE_URL=${databaseUrl} && npm run migrate`)

    } catch (error: any) {
        console.log(error.message)
    }
}

async function generate() {
    try {
        execSync(`npm run prisma:generate`)

    } catch (error: any) {
        console.log(error.message)
    }
}

function setEnvs(): void {
    process.env.JWT_SECRET = config.jwtSecret
    process.env.API_KEY = config.apiKey
    process.env.FULLNAME_ADMIN = config.adminFullName
    process.env.CPF_ADMIN = config.generalAdminCpf
    process.env.PROFILE_ADMIN = config.generalAdminProfile
    process.env.PASSWORD_ADMIN = config.generalAdminPassword
}

async function initializeGeneralAdministrator(): Promise<void> {
    const useCase = container.get<InitializeAdminUseCase>(TYPES.InitializeAdminUseCase);
    await useCase.execute();
}

// Before each
let dbId = 0;
beforeEach(async () => {
    const databaseUrl = dbContainer.getConnectionUrl()
    const newDatabaseUrl = await createDb(databaseUrl)
    setDatabaseUrlEnv(newDatabaseUrl)
    await initializeGeneralAdministrator()
}, 30000)

async function createDb(databaseUrl: string): Promise<string> {
    const templateDbName = "template_db"
    const newDbName = `test_${dbId++}_db`

    const prismaClient = new PrismaClient({
        datasourceUrl: databaseUrl
    })
    await prismaClient.$connect()
    await prismaClient.$executeRawUnsafe(`CREATE DATABASE ${newDbName} TEMPLATE ${templateDbName}`)
    await prismaClient.$disconnect()

    return databaseUrl.replace(templateDbName, newDbName)
}

function setDatabaseUrlEnv(databaseUrl: string): void {
    process.env.DATABASE_URL = databaseUrl
}

// After all
afterAll(async () => {
    const dbContainer = DbContainer.getInstance()
    await dbContainer.stop()
}, 1000 * 60 * 5) // 5 minutes
