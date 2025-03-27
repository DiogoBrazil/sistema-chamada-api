import supertest from "supertest"
import { faker } from "@faker-js/faker"
import { cpf } from "cpf-cnpj-validator"

import app from "../../src/app"
import { ProfileType } from "../../src/constants/profilesTypes"
import { AuthenticationBuilder } from "./AuthenticationBuilder"
import { config } from "../utils/config"

type CredentialsType = { email: string, cpf: string, password: string }

export class ProfessionalBuilder {

    private readonly apiKey: string = config.apiKey
    private readonly fullName: string = faker.person.fullName()
    private readonly cpf: string = cpf.generate()
    private readonly email: string = faker.internet.email()
    private readonly password: string = faker.internet.password()
    private readonly gender: string = "masculino"
    private readonly phoneNumber: string = faker.phone.number()

    async buildGeneralLocalAdministrator(cityId: number): Promise<CredentialsType> {
        const data = {
            fullName: this.fullName,
            cpf: this.cpf,
            email: this.email,
            password: this.password,
            profile: ProfileType.GENERAL_LOCAL_ADMINISTRATOR,
            sex: this.gender,
            phone: this.phoneNumber,
            cityId: cityId,
        }
        return this.build(data)
    }

    private async build(data: object): Promise<CredentialsType> {
        const authorizationToken = await new AuthenticationBuilder().buildGeneralAdministratorAuthToken()

        const response = await supertest(app)
            .post("/api/professionals")
            .send(data)
            .set({
                api_key: this.apiKey,
                authorization: authorizationToken
            })

        if (response.status == 201) {
            return {
                cpf: this.cpf,
                password: this.password,
                email: this.email,
            }
        }
        console.log({
            status: response.status,
            body: response.body,
        })
        throw new Error("Error")
    }

    async buildLocalAdministrator(cityId: number, healthUnitId: number): Promise<CredentialsType> {
        const data = {
            fullName: this.fullName,
            cpf: this.cpf,
            email: this.email,
            password: this.password,
            profile: ProfileType.LOCAL_ADMINISTRATOR,
            sex: this.gender,
            phone: this.phoneNumber,
            healthUnitId: healthUnitId,
            cityId: cityId,
        }

        return this.build(data)
    }

    async buildDoctor(cityId: number, healthUnitId: number): Promise<CredentialsType> {
        const data = {
            fullName: this.fullName,
            cpf: this.cpf,
            email: this.email,
            password: this.password,
            profile: ProfileType.DOCTOR,
            sex: this.gender,
            phone: this.phoneNumber,
            healthUnitId: healthUnitId,
            cityId: cityId,
        }

        return this.build(data)
    }

    async buildNurse(cityId: number, healthUnitId: number): Promise<CredentialsType> {
        const data = {
            fullName: this.fullName,
            cpf: this.cpf,
            email: this.email,
            password: this.password,
            profile: ProfileType.NURSE,
            sex: this.gender,
            phone: this.phoneNumber,
            healthUnitId: healthUnitId,
            cityId: cityId,
        }

        return this.build(data)
    }

    async buildNursingTechnician(cityId: number, healthUnitId: number): Promise<CredentialsType> {
        const data = {
            fullName: this.fullName,
            cpf: this.cpf,
            email: this.email,
            password: this.password,
            profile: ProfileType.NURSING_TECHNICIAN,
            sex: this.gender,
            phone: this.phoneNumber,
            healthUnitId: healthUnitId,
            cityId: cityId,
        }

        return this.build(data)
    }

    async buildOdontologist(cityId: number, healthUnitId: number): Promise<CredentialsType> {
        const data = {
            fullName: this.fullName,
            cpf: this.cpf,
            email: this.email,
            password: this.password,
            profile: ProfileType.ODONTOLOGIST,
            sex: this.gender,
            phone: this.phoneNumber,
            healthUnitId: healthUnitId,
            cityId: cityId,
        }

        return this.build(data)
    }

    async buildReceptionist(cityId: number, healthUnitId: number): Promise<CredentialsType> {
        const data = {
            fullName: this.fullName,
            cpf: this.cpf,
            email: this.email,
            password: this.password,
            profile: ProfileType.RECEPTIONIST,
            sex: this.gender,
            phone: this.phoneNumber,
            healthUnitId: healthUnitId,
            cityId: cityId,
        }

        return this.build(data)
    }

    async buildAcs(cityId: number, healthUnitId: number): Promise<CredentialsType> {
        const data = {
            fullName: this.fullName,
            cpf: this.cpf,
            email: this.email,
            password: this.password,
            profile: ProfileType.ACS,
            sex: this.gender,
            phone: this.phoneNumber,
            healthUnitId: healthUnitId,
            cityId: cityId,
        }

        return this.build(data)
    }
}
