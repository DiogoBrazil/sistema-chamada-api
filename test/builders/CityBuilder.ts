import supertest from "supertest";
import app from "../../src/app";
import { config } from "../utils/config";
import { AuthenticationBuilder } from "./AuthenticationBuilder"
import { faker } from "@faker-js/faker";

export class CityBuilder {

    private apiKey: string = config.apiKey
    private name: string = faker.location.city()
    private state: string = faker.location.state({
        abbreviated: true
    })

    async build(): Promise<number> {
        const authorizationToken = await new AuthenticationBuilder().buildGeneralAdministratorAuthToken()

        const response = await supertest(app)
            .post("/api/city")
            .send({
                name: this.name,
                state: this.state
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
