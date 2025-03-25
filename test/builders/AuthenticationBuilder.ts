import supertest from "supertest"
import app from "../../src/app"
import { config } from "../utils/config"

export class AuthenticationBuilder {

    private cpf: string = ""
    private password: string = ""
    private apiKey: string = config.apiKey

    withCpf(cpf: string): AuthenticationBuilder {
        this.cpf = cpf
        return this
    }

    withPassword(password: string): AuthenticationBuilder {
        this.password = password
        return this
    }

    async buildGeneralAdministratorAuthToken(): Promise<string> {
        this.cpf = config.generalAdminCpf
        this.password = config.generalAdminPassword
        return this.build()
    }

    async build(): Promise<string> {
        const response = await supertest(app)
            .post("/api/auth/login")
            .send({
                cpf: this.cpf,
                password: this.password
            })
            .set({
                "api_key": this.apiKey
            })

        if (response.status == 200) {
            return "Bearer " + response.body.data.token
        }

        console.log({
            status: response.status,
            body: response.body,
        })
        throw new Error("Invalid credentials")
    }
}
