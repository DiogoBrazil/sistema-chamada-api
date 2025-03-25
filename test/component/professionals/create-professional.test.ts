import { beforeEach, describe, expect, test } from "@jest/globals"
import supertest from "supertest"

import app from "../../../src/app"
import { AuthenticationBuilder } from "../../builders/AuthenticationBuilder"
import { config } from "../../utils/config"
import { ProfessionalBuilder } from "../../builders/ProfessionalBuilder"
import { CityBuilder } from "../../builders/CityBuilder"
import { HealthUnitBuilder } from "../../builders/HealthUnitBuilder"
import { faker } from "@faker-js/faker"
import { cpf as cpfLib } from "cpf-cnpj-validator"
import { ProfileType } from "../../../src/constants/profilesTypes"


describe("POST /api/professionals", () => {
    let apiKey = config.apiKey

    let cityId: number
    let healthUnitId: number
    beforeEach(async () => {
        cityId = await new CityBuilder().build()
        healthUnitId = await new HealthUnitBuilder().build(cityId)
    })

    describe("should return unauthorized http response", () => {
        test("when api_key header is missing", async () => {
            const response = await supertest(app)
                .post("/api/professionals")

            expect(response.status).toEqual(401)
            expect(response.body).toEqual({
                error: "API key is required"
            })
        })

        test("when api_key header is invalid", async () => {
            const response = await supertest(app)
                .post("/api/professionals")
                .set({
                    api_key: "invalid_api_key"
                })

            expect(response.status).toEqual(401)
            expect(response.body).toEqual({
                error: "Invalid api_key"
            })
        })

        test("when authorization header is missing", async () => {
            const response = await supertest(app)
                .post("/api/professionals")
                .set({
                    api_key: apiKey
                })

            expect(response.status).toEqual(401)
            expect(response.body).toEqual({
                error: "Token not provided.",
            })
        })

        test("when authorization header is invalid", async () => {
            const response = await supertest(app)
                .post("/api/professionals")
                .set({
                    api_key: apiKey,
                    authorization: "invalid_token"
                })

            expect(response.status).toEqual(401)
            expect(response.body).toEqual({
                error: "Invalid token format.",
            })
        })
    })

    describe("should return forbidden http response with message 'Only administrators can manage professionals'", () => {
        const expectedResponseBody = {
            message: "Only administrators can manage professionals",
            data: null,
            status_code: 403
        }

        test("when requester is a doctor", async () => {
            const credentials = await new ProfessionalBuilder().buildDoctor(cityId, healthUnitId)
            const authToken = await new AuthenticationBuilder()
                .withCpf(credentials.cpf)
                .withPassword(credentials.password)
                .build()

            const response = await supertest(app)
                .post("/api/professionals")
                .set({
                    api_key: apiKey,
                    authorization: authToken
                })

            expect(response.status).toEqual(403)
            expect(response.body).toEqual(expectedResponseBody)
        })

        test("when requester is a nurse", async () => {
            const credentials = await new ProfessionalBuilder().buildNurse(cityId, healthUnitId)
            const authToken = await new AuthenticationBuilder()
                .withCpf(credentials.cpf)
                .withPassword(credentials.password)
                .build()

            const response = await supertest(app)
                .post("/api/professionals")
                .set({
                    api_key: apiKey,
                    authorization: authToken
                })

            expect(response.status).toEqual(403)
            expect(response.body).toEqual(expectedResponseBody)
        })

        test("when requester is a nursing technician", async () => {
            const credentials = await new ProfessionalBuilder().buildNursingTechnician(cityId, healthUnitId)
            const authToken = await new AuthenticationBuilder()
                .withCpf(credentials.cpf)
                .withPassword(credentials.password)
                .build()

            const response = await supertest(app)
                .post("/api/professionals")
                .set({
                    api_key: apiKey,
                    authorization: authToken
                })

            expect(response.status).toEqual(403)
            expect(response.body).toEqual(expectedResponseBody)
        })

        test("when requester is an odontologist", async () => {
            const credentials = await new ProfessionalBuilder().buildOdontologist(cityId, healthUnitId)
            const authToken = await new AuthenticationBuilder()
                .withCpf(credentials.cpf)
                .withPassword(credentials.password)
                .build()

            const response = await supertest(app)
                .post("/api/professionals")
                .set({
                    api_key: apiKey,
                    authorization: authToken
                })

            expect(response.status).toEqual(403)
            expect(response.body).toEqual(expectedResponseBody)
        })

        test("when requester is a receptionist", async () => {
            const credentials = await new ProfessionalBuilder().buildReceptionist(cityId, healthUnitId)
            const authToken = await new AuthenticationBuilder()
                .withCpf(credentials.cpf)
                .withPassword(credentials.password)
                .build()

            const response = await supertest(app)
                .post("/api/professionals")
                .set({
                    api_key: apiKey,
                    authorization: authToken
                })

            expect(response.status).toEqual(403)
            expect(response.body).toEqual(expectedResponseBody)
        })

        test("when requester is an ACS", async () => {
            const credentials = await new ProfessionalBuilder().buildAcs(cityId, healthUnitId)
            const authToken = await new AuthenticationBuilder()
                .withCpf(credentials.cpf)
                .withPassword(credentials.password)
                .build()

            const response = await supertest(app)
                .post("/api/professionals")
                .set({
                    api_key: apiKey,
                    authorization: authToken
                })

            expect(response.status).toEqual(403)
            expect(response.body).toEqual(expectedResponseBody)
        })
    })

    describe("should return internal server error http response", () => {
        let credentials: { cpf: string, password: string }
        beforeEach(async () => {
            credentials = await new ProfessionalBuilder().buildGeneralLocalAdministrator(cityId)
        })

        describe("when trying create a general administrator", () => {
            test("and the requester is general administrator", async () => {
                const authToken = await new AuthenticationBuilder().buildGeneralAdministratorAuthToken()

                const response = await supertest(app)
                    .post("/api/professionals")
                    .send({
                        profile: ProfileType.GENERAL_ADMINISTRATOR
                    })
                    .set({
                        api_key: apiKey,
                        authorization: authToken
                    })

                expect(response.status).toEqual(500)
                expect(response.body).toEqual({
                    message: "General administrators cannot create other general administrators",
                    data: null,
                    status_code: 500,
                })
            })

            test("and requester is general local administrator", async () => {
                const authToken = await new AuthenticationBuilder()
                    .withCpf(credentials.cpf)
                    .withPassword(credentials.password)
                    .build()

                const response = await supertest(app)
                    .post("/api/professionals")
                    .send({
                        profile: ProfileType.GENERAL_ADMINISTRATOR
                    })
                    .set({
                        api_key: apiKey,
                        authorization: authToken
                    })

                expect(response.status).toEqual(500)
                expect(response.body).toEqual({
                    message: "General local administrators cannot create general administrators",
                    data: null,
                    status_code: 500,
                })
            })

        })

        describe("when trying create a general local administrator", () => {
            test("and requester is general local administrator", async () => {
                const authToken = await new AuthenticationBuilder()
                    .withCpf(credentials.cpf)
                    .withPassword(credentials.password)
                    .build()

                const response = await supertest(app)
                    .post("/api/professionals")
                    .send({
                        profile: ProfileType.GENERAL_LOCAL_ADMINISTRATOR
                    })
                    .set({
                        api_key: apiKey,
                        authorization: authToken
                    })

                expect(response.status).toEqual(500)
                expect(response.body).toEqual({
                    message: "General local administrators cannot create other general local administrators",
                    data: null,
                    status_code: 500,
                })
            })
        })
    })

    describe("should return created http response", () => {
        let fullName: string
        let gender: string
        let phoneNumber: string
        let cpf: string
        let email: string
        let password: string
        beforeEach(() => {
            fullName = faker.person.fullName()
            gender = "masculino"
            phoneNumber = faker.phone.number()
            cpf = cpfLib.generate()
            email = faker.internet.email()
            password = faker.internet.password()
        })

        test.each([
            ProfileType.GENERAL_LOCAL_ADMINISTRATOR,
            ProfileType.LOCAL_ADMINISTRATOR,
            ProfileType.DOCTOR,
            ProfileType.NURSE,
            ProfileType.NURSING_TECHNICIAN,
            ProfileType.ODONTOLOGIST,
            ProfileType.RECEPTIONIST,
            ProfileType.ACS,
        ])("when requester is a general administrator and the profile is %s", async (profile) => {
            const generalAdministratorAuthToken = await new AuthenticationBuilder().buildGeneralAdministratorAuthToken()

            const response = await supertest(app)
                .post("/api/professionals")
                .send({
                    fullName: fullName,
                    sex: gender,
                    phone: phoneNumber,
                    cpf: cpf,
                    email: email,
                    password: password,
                    profile: profile,
                    cityId: cityId,
                    healthUnitId: healthUnitId,
                })
                .set({
                    api_key: apiKey,
                    authorization: generalAdministratorAuthToken
                })

            expect(response.status).toEqual(201)
            expect(response.body).toMatchObject({
                message: "Professional created successfully",
                data: expect.any(Object),
                status_code: 201,
            })
            expect(response.body.data).toHaveProperty("id", expect.any(Number))
            expect(response.body.data).toHaveProperty("fullName", fullName)
            expect(response.body.data).toHaveProperty("cpf", cpf)
            expect(response.body.data).toHaveProperty("profile", profile)
            expect(response.body.data).toHaveProperty("currentOffice", null)
            expect(response.body.data).toHaveProperty("attendanceMode", null)
            expect(response.body.data).toHaveProperty("phone", phoneNumber)
            expect(response.body.data).toHaveProperty("sex", gender)
            expect(response.body.data).toHaveProperty("email", email)
            expect(response.body.data).toHaveProperty("active", true)
            expect(response.body.data).toHaveProperty("cityId", cityId)
        })
    })
})
