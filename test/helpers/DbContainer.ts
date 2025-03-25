import { GenericContainer, StartedTestContainer } from "testcontainers"

const containerIsNotRunningError = new Error("Container is not running")

export class DbContainer {
    private readonly dbUser = "postgres"
    private readonly dbPassword = "postgrespw"
    private readonly dbName = "template_db"
    private startedTestContainer: StartedTestContainer | null = null
    private static instance: DbContainer | null = null

    private constructor() {
    }

    static getInstance() {
        if (DbContainer.instance == null) {
            DbContainer.instance = new DbContainer();
        }

        return DbContainer.instance
    }

    async start(): Promise<void> {
        if (this.startedTestContainer != null) {
            return
        }

        this.startedTestContainer = await new GenericContainer("postgres:16-alpine")
            .withEnvironment({
                POSTGRES_USER: this.dbUser,
                POSTGRES_PASSWORD: this.dbPassword,
                POSTGRES_DB: this.dbName,
            })
            .withExposedPorts(5432)
            .start();
        await this.sleep(2000)
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    async stop(): Promise<void> {
        if (this.startedTestContainer == null) {
            throw containerIsNotRunningError
        }

        await this.startedTestContainer.stop()
    }

    getConnectionUrl(): string {
        const postgresPort = this.getPort()
        return `postgresql://${this.dbUser}:${this.dbPassword}@localhost:${postgresPort}/${this.dbName}?schema=public`
    }

    getPort(): number {
        if (this.startedTestContainer == null) {
            throw containerIsNotRunningError
        }

        return this.startedTestContainer.getMappedPort(5432)
    }
}
