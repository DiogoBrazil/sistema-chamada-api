import supertest from "supertest";
import { config } from "../utils/config";
import { AuthenticationBuilder } from "./AuthenticationBuilder";
import app from "../../src/app";
import { cnpj } from "cpf-cnpj-validator";
import { faker } from "@faker-js/faker";

export class HealthUnitBuilder {

    private apiKey: string = config.apiKey
    private name: string = faker.company.name()
    private cnpj: string = cnpj.generate()
    private phoneNumber: string = faker.phone.number()
    private street: string = faker.location.street()
    private neighborhood: string = faker.location.country()
    private number: string = String(faker.number.int())
    private zipCode: string = faker.location.zipCode()

    async build(cityId: number): Promise<number> {
        const authorizationToken = await new AuthenticationBuilder().buildGeneralAdministratorAuthToken()

        const response = await supertest(app)
            .post("/api/health-units")
            .send({
                name: this.name,
                cnpj: this.cnpj,
                phone: this.phoneNumber,
                cityId: cityId,
                address: {
                    street: this.street,
                    neighborhood: this.neighborhood,
                    number: this.number,
                    zipCode: this.zipCode,
                }
            })
            .set({
                api_key: this.apiKey,
                authorization: authorizationToken
            })

        if (response.status == 201) {
            return response.body.data.id
        }
        console.log({
            status: response.status,
            body: response.body,
        })
        throw new Error("Error")
    }
}
