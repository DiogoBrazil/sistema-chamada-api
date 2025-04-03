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


describe("PUT /api/professionals/:id", () => {
    let apiKey = config.apiKey

    let cityId: number
    let healthUnitId: number
    let fullName: string
    let gender: string
    let phoneNumber: string
    let cpf: string
    let email: string
    let password: string
    beforeEach(async () => {
        cityId = await new CityBuilder().build()
        healthUnitId = await new HealthUnitBuilder().build(cityId)
        fullName = faker.person.fullName()
        // gender = "masculino"
        // phoneNumber = faker.phone.number()
        // cpf = cpfLib.generate()
        // email = faker.internet.email()
        // password = faker.internet.password()
    })

    describe("should return unauthorized http response", () => {
        test("when api_key header is missing", async () => {
            const response = await supertest(app)
                .put("/api/professionals/1")

            expect(response.status).toEqual(401)
            expect(response.body).toEqual({
                error: "API key is required"
            })
        })

        test("when api_key header is invalid", async () => {
            const response = await supertest(app)
                .put("/api/professionals/1")
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
                .put("/api/professionals/1")
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
                .put("/api/professionals/1")
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

    describe("should return forbidden http response", () => {
        describe("with message 'Only administrators can update professionals'", () => {
            const expectedResponseBody = {
                message: "Only administrators can update professionals",
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
                    .put(`/api/professionals/${credentials.id}`)
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
                    .put(`/api/professionals/${credentials.id}`)
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
                    .put(`/api/professionals/${credentials.id}`)
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
                    .put(`/api/professionals/${credentials.id}`)
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
                    .put(`/api/professionals/${credentials.id}`)
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
                    .put(`/api/professionals/${credentials.id}`)
                    .set({
                        api_key: apiKey,
                        authorization: authToken
                    })

                expect(response.status).toEqual(403)
                expect(response.body).toEqual(expectedResponseBody)
            })
        })

        describe("when the requester is local administrator", () => {
            test("and is trying update someone to general administrator", async () => {
                const credentials = await new ProfessionalBuilder().buildLocalAdministrator(cityId, healthUnitId)
                const authToken = await new AuthenticationBuilder()
                    .withCpf(credentials.cpf)
                    .withPassword(credentials.password)
                    .build()

                const response = await supertest(app)
                    .put(`/api/professionals/${credentials.id}`)
                    .send({
                        profile: ProfileType.GENERAL_ADMINISTRATOR
                    })
                    .set({
                        api_key: apiKey,
                        authorization: authToken
                    })

                expect(response.status).toEqual(403)
                expect(response.body).toEqual({
                    message: "Local administrators cannot update to administrator profiles",
                    data: null,
                    status_code: 403,
                })
            })

            test("and is trying update someone to general local administrator", async () => {
                const credentials = await new ProfessionalBuilder().buildLocalAdministrator(cityId, healthUnitId)
                const authToken = await new AuthenticationBuilder()
                    .withCpf(credentials.cpf)
                    .withPassword(credentials.password)
                    .build()

                const response = await supertest(app)
                    .put(`/api/professionals/${credentials.id}`)
                    .send({
                        profile: ProfileType.GENERAL_LOCAL_ADMINISTRATOR
                    })
                    .set({
                        api_key: apiKey,
                        authorization: authToken
                    })

                expect(response.status).toEqual(403)
                expect(response.body).toEqual({
                    message: "Local administrators cannot update to administrator profiles",
                    data: null,
                    status_code: 403,
                })
            })

            test("and is trying update someone to local administrator", async () => {
                const credentials = await new ProfessionalBuilder().buildLocalAdministrator(cityId, healthUnitId)
                const authToken = await new AuthenticationBuilder()
                    .withCpf(credentials.cpf)
                    .withPassword(credentials.password)
                    .build()

                const response = await supertest(app)
                    .put(`/api/professionals/${credentials.id}`)
                    .send({
                        profile: ProfileType.LOCAL_ADMINISTRATOR
                    })
                    .set({
                        api_key: apiKey,
                        authorization: authToken
                    })

                expect(response.status).toEqual(403)
                expect(response.body).toEqual({
                    message: "Local administrators cannot update to administrator profiles",
                    data: null,
                    status_code: 403,
                })
            })

            //TODO: Encontrar forma de descobrir o ID do general administrator
            test.skip.each([
                ProfileType.DOCTOR,
                ProfileType.NURSE,
                ProfileType.NURSING_TECHNICIAN,
                ProfileType.ODONTOLOGIST,
                ProfileType.RECEPTIONIST,
                ProfileType.ACS,
            ])("and is trying update general administrator", async (profile) => {

                const credentials = await new ProfessionalBuilder().buildLocalAdministrator(cityId, healthUnitId)
                const authToken = await new AuthenticationBuilder()
                    .withCpf(credentials.cpf)
                    .withPassword(credentials.password)
                    .build()

                const response = await supertest(app)
                    .put("/api/professionals/1")
                    .send({
                        profile: profile
                    })
                    .set({
                        api_key: apiKey,
                        authorization: authToken
                    })

                expect(response.status).toEqual(403)
                expect(response.body).toEqual({
                    message: "You do not have permission to manage this professional",
                    data: null,
                    status_code: 403,
                })
            })
        })

        //TODO: Checar porque esta dando erro 404 not found já que o profissional é criado neste teste.
        //Além disso, parece que o express está retornando a resposta duas vezes.
        //Verificar se não existem promises que não estão sendo resolvidas.
        test.skip.each([
            ProfileType.DOCTOR,
            ProfileType.NURSE,
            ProfileType.NURSING_TECHNICIAN,
            ProfileType.ODONTOLOGIST,
            ProfileType.RECEPTIONIST,
            ProfileType.ACS,
        ])("and is trying update general local administrator", async (profile) => {
            const generalLocalAdministratorCredentials = await new ProfessionalBuilder().buildGeneralLocalAdministrator(cityId)
            const credentials = await new ProfessionalBuilder().buildLocalAdministrator(cityId, healthUnitId)
            const authToken = await new AuthenticationBuilder()
                .withCpf(credentials.cpf)
                .withPassword(credentials.password)
                .build()

            const response = await supertest(app)
                .put(`/api/professionals/${generalLocalAdministratorCredentials.id}`)
                .send({
                    profile: profile
                })
                .set({
                    api_key: apiKey,
                    authorization: authToken
                })

            // expect(response.status).toEqual(403)
            expect(response.body).toEqual({
                message: "You do not have permission to manage this professional",
                data: null,
                status_code: 403,
            })
        })

        test.each([
            ProfileType.DOCTOR,
            ProfileType.NURSE,
            ProfileType.NURSING_TECHNICIAN,
            ProfileType.ODONTOLOGIST,
            ProfileType.RECEPTIONIST,
            ProfileType.ACS,
        ])("and is trying update local administrator", async (profile) => {
            const credentials = await new ProfessionalBuilder().buildLocalAdministrator(cityId, healthUnitId)
            const authToken = await new AuthenticationBuilder()
                .withCpf(credentials.cpf)
                .withPassword(credentials.password)
                .build()

            const response = await supertest(app)
                .put(`/api/professionals/${credentials.id}`)
                .send({
                    profile: profile
                })
                .set({
                    api_key: apiKey,
                    authorization: authToken
                })

            expect(response.status).toEqual(403)
            expect(response.body).toEqual({
                message: "Local administrators cannot update administrator profiles",
                data: null,
                status_code: 403,
            })
        })
    })

    describe("should return bad request http response", () => {
        describe("when the id is not a number", () => {
            test("and the requester is a general administrator", async () => {
                const authToken = await new AuthenticationBuilder().buildGeneralAdministratorAuthToken()

                const response = await supertest(app)
                    .put("/api/professionals/abc")
                    .set({
                        api_key: apiKey,
                        authorization: authToken
                    })

                expect(response.status).toEqual(400)
                expect(response.body).toEqual({
                    message: "Invalid data provided",
                    data: null,
                    status_code: 400,
                })
            })

            //TODO: Nunca ocorre porque no middleware canManageProfessional sempre é checado se a healthUnit é igual.
            // Como o general local administrator não tem healthUnit nunca passa do middleware.
            test.skip("and the requester is a general local administrator", async () => {
                const credentials = await new ProfessionalBuilder().buildGeneralLocalAdministrator(cityId)
                const authToken = await new AuthenticationBuilder()
                    .withCpf(credentials.cpf)
                    .withPassword(credentials.password)
                    .build()

                const response = await supertest(app)
                    .put("/api/professionals/abc")
                    .set({
                        api_key: apiKey,
                        authorization: authToken
                    })

                expect(response.status).toEqual(400)
                expect(response.body).toEqual({
                    message: "Invalid data provided",
                    data: null,
                    status_code: 400,
                })
            })

            //TODO: Nunca ocorre porque está dando erro 500
            test.skip("and the requester is a local administrator", async () => {
                const credentials = await new ProfessionalBuilder().buildLocalAdministrator(cityId, healthUnitId)
                const authToken = await new AuthenticationBuilder()
                    .withCpf(credentials.cpf)
                    .withPassword(credentials.password)
                    .build()

                const response = await supertest(app)
                    .put("/api/professionals/abc")
                    .set({
                        api_key: apiKey,
                        authorization: authToken
                    })

                expect(response.status).toEqual(400)
                expect(response.body).toEqual({
                    message: "Invalid data provided",
                    data: null,
                    status_code: 400,
                })
            })
        })
    })

    describe("should return not found http response", () => {
        describe("when the professional does not exist", () => {
            test("and the requester is a local administrator", async () => {
                const credentials = await new ProfessionalBuilder().buildLocalAdministrator(cityId, healthUnitId)
                const authToken = await new AuthenticationBuilder()
                    .withCpf(credentials.cpf)
                    .withPassword(credentials.password)
                    .build()

                const response = await supertest(app)
                    .put("/api/professionals/0")
                    .set({
                        api_key: apiKey,
                        authorization: authToken
                    })

                expect(response.status).toEqual(404)
                expect(response.body).toEqual({
                    message: "Professional not found",
                    data: null,
                    status_code: 404,
                })
            })
        })
    })

    describe("should return ok http response", () => {
        test("when the requester is general administrator", async () => {
            const acsCredentials = await new ProfessionalBuilder()
                .buildAcs(cityId, healthUnitId)
            const authToken = await new AuthenticationBuilder()
                .withCpf(config.generalAdminCpf)
                .withPassword(config.generalAdminPassword)
                .build()

            const response = await supertest(app)
                .put(`/api/professionals/${acsCredentials.id}`)
                .send({
                    fullName: fullName,
                })
                .set({
                    api_key: apiKey,
                    authorization: authToken
                })

            expect(response.status).toEqual(200)
            expect(response.body).toEqual({
                message: "Updated successfully",
                status_code: 200,
                data: {
                    id: acsCredentials.id,
                    active: expect.any(Boolean),
                    attendanceMode: null,
                    cityId: cityId,
                    cpf: acsCredentials.cpf,
                    currentOffice: null,
                    email: acsCredentials.email,
                    fullName: fullName,
                    phone: expect.any(String),
                    profile: expect.any(String),
                    sex: expect.any(String)
                },
            })
        })

        //TODO: São da mesma cidade mas está lançando erro 403 e dizendo que não é da mesma cidade
        test.skip("when the requester is general local administrator", async () => {
            const acsCredentials = await new ProfessionalBuilder()
                .buildAcs(cityId, healthUnitId)
            const generalLocalAdministratorCredentials = await new ProfessionalBuilder()
                .buildGeneralLocalAdministrator(cityId)
            const authToken = await new AuthenticationBuilder()
                .withCpf(generalLocalAdministratorCredentials.cpf)
                .withPassword(generalLocalAdministratorCredentials.password)
                .build()

            const response = await supertest(app)
                .put(`/api/professionals/${acsCredentials.id}`)
                .send({
                    fullName: fullName,
                })
                .set({
                    api_key: apiKey,
                    authorization: authToken
                })

            // expect(response.status).toEqual(200)
            expect(response.body).toEqual({
                message: "Updated successfully",
                status_code: 200,
                data: {
                    id: acsCredentials.id,
                    active: expect.any(Boolean),
                    attendanceMode: null,
                    cityId: cityId,
                    cpf: acsCredentials.cpf,
                    currentOffice: null,
                    email: acsCredentials.email,
                    fullName: fullName,
                    phone: expect.any(String),
                    profile: expect.any(String),
                    sex: expect.any(String)
                },
            })
        })

        //TODO: Está lançando 404 mesmo com o profissional existente
        test.skip("when the requester is local administrator", async () => {
            const acsCredentials = await new ProfessionalBuilder()
                .buildAcs(cityId, healthUnitId)
            const localAdministratorCredentials = await new ProfessionalBuilder()
                .buildLocalAdministrator(cityId, healthUnitId)
            const authToken = await new AuthenticationBuilder()
                .withCpf(localAdministratorCredentials.cpf)
                .withPassword(localAdministratorCredentials.password)
                .build()

            const response = await supertest(app)
                .put(`/api/professionals/${acsCredentials.id}`)
                .send({
                    fullName: fullName,
                })
                .set({
                    api_key: apiKey,
                    authorization: authToken
                })

            expect(response.status).toEqual(200)
            expect(response.body).toEqual({
                message: "Updated successfully",
                status_code: 200,
                data: {
                    id: acsCredentials.id,
                    active: expect.any(Boolean),
                    attendanceMode: null,
                    cityId: cityId,
                    cpf: acsCredentials.cpf,
                    currentOffice: null,
                    email: acsCredentials.email,
                    fullName: fullName,
                    phone: expect.any(String),
                    profile: expect.any(String),
                    sex: expect.any(String)
                },
            })
        })
    })
})
