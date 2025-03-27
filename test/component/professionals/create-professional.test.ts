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
        gender = "masculino"
        phoneNumber = faker.phone.number()
        cpf = cpfLib.generate()
        email = faker.internet.email()
        password = faker.internet.password()
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

    describe("should return forbidden http response", () => {
        describe("with message 'Only administrators can manage professionals'", () => {
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

                expect(response.status).toEqual(403)
                expect(response.body).toEqual({
                    message: "General administrators cannot create other general administrators",
                    data: null,
                    status_code: 403,
                })
            })

            test("and the requester is general local administrator", async () => {
                const credentials = await new ProfessionalBuilder().buildGeneralLocalAdministrator(cityId)
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

                expect(response.status).toEqual(403)
                expect(response.body).toEqual({
                    message: "General local administrators cannot create general administrators",
                    data: null,
                    status_code: 403,
                })
            })

            test("and the requester is local administrator", async () => {
                const credentials = await new ProfessionalBuilder().buildLocalAdministrator(cityId, healthUnitId)
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

                expect(response.status).toEqual(403)
                expect(response.body).toEqual({
                    message: "Local administrators cannot create administrator profiles",
                    data: null,
                    status_code: 403,
                })
            })
        })

        describe("when trying create a general local administrator", () => {
            test("and the requester is general local administrator", async () => {
                const credentials = await new ProfessionalBuilder().buildGeneralLocalAdministrator(cityId)
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

                expect(response.status).toEqual(403)
                expect(response.body).toEqual({
                    message: "General local administrators cannot create other general local administrators",
                    data: null,
                    status_code: 403,
                })
            })

            test("and the requester is local administrator", async () => {
                const credentials = await new ProfessionalBuilder().buildLocalAdministrator(cityId, healthUnitId)
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

                expect(response.status).toEqual(403)
                expect(response.body).toEqual({
                    message: "Local administrators cannot create administrator profiles",
                    data: null,
                    status_code: 403,
                })
            })
        })

        describe("when trying create a local administrator", () => {
            test("and the requester is local administrator", async () => {
                const credentials = await new ProfessionalBuilder().buildLocalAdministrator(cityId, healthUnitId)
                const authToken = await new AuthenticationBuilder()
                    .withCpf(credentials.cpf)
                    .withPassword(credentials.password)
                    .build()

                const response = await supertest(app)
                    .post("/api/professionals")
                    .send({
                        profile: ProfileType.LOCAL_ADMINISTRATOR
                    })
                    .set({
                        api_key: apiKey,
                        authorization: authToken
                    })

                expect(response.status).toEqual(403)
                expect(response.body).toEqual({
                    message: "Local administrators cannot create administrator profiles",
                    data: null,
                    status_code: 403,
                })
            })
        })
    })

    describe("should return conflict http response", () => {
        test("when there is a general local administrator for this city", async () => {
            await new ProfessionalBuilder().buildGeneralLocalAdministrator(cityId)
            const authToken = await new AuthenticationBuilder().buildGeneralAdministratorAuthToken()

            const response = await supertest(app)
                .post("/api/professionals")
                .send({
                    profile: ProfileType.GENERAL_LOCAL_ADMINISTRATOR,
                    cityId: cityId,
                })
                .set({
                    api_key: apiKey,
                    authorization: authToken,
                })

            expect(response.status).toEqual(409)
            expect(response.body).toEqual({
                message: "There is already a general local administrator for this city",
                data: null,
                status_code: 409,
            })
        })

        test("when a local administrator for this health unit", async () => {
            await new ProfessionalBuilder().buildLocalAdministrator(cityId, healthUnitId)
            const authToken = await new AuthenticationBuilder().buildGeneralAdministratorAuthToken()

            const response = await supertest(app)
                .post("/api/professionals")
                .send({
                    profile: ProfileType.LOCAL_ADMINISTRATOR,
                    cityId: cityId,
                    healthUnitId: healthUnitId,
                })
                .set({
                    api_key: apiKey,
                    authorization: authToken
                })

            expect(response.status).toEqual(409)
            expect(response.body).toEqual({
                message: "There is already a local administrator for this health unit",
                data: null,
                status_code: 409,
            })
        })

        test("when the email is in use", async () => {
            const credentials = await new ProfessionalBuilder().buildDoctor(cityId, healthUnitId)
            const authToken = await new AuthenticationBuilder().buildGeneralAdministratorAuthToken()

            const response = await supertest(app)
                .post("/api/professionals")
                .send({
                    email: credentials.email,
                    password: credentials.password,
                    profile: ProfileType.DOCTOR,
                    cityId: cityId,
                    healthUnitId: healthUnitId,
                })
                .set({
                    api_key: apiKey,
                    authorization: authToken
                })

            expect(response.status).toEqual(409)
            expect(response.body).toEqual({
                message: "Email already in use.",
                data: null,
                status_code: 409,
            })
        })

        //TODO: Lançando internal server error. Aparentemente não está checando se o CPF está em uso.
        test.skip("when the cpf is in use", async () => {
            const credentials = await new ProfessionalBuilder().buildDoctor(cityId, healthUnitId)
            const authToken = await new AuthenticationBuilder().buildGeneralAdministratorAuthToken()
            const email = faker.internet.email()

            const response = await supertest(app)
                .post("/api/professionals")
                .send({
                    cpf: credentials.cpf,
                    email: email,
                    password: credentials.password,
                    profile: ProfileType.DOCTOR,
                    cityId: cityId,
                    healthUnitId: healthUnitId,
                })
                .set({
                    api_key: apiKey,
                    authorization: authToken
                })

            expect(response.status).toEqual(409)
            expect(response.body).toEqual({
                message: "CPF already in use.",
                data: null,
                status_code: 409,
            })
        })
    })

    describe("should return bad request http response", () => {
        test("when the city is required", async () => {
            const authToken = await new AuthenticationBuilder().buildGeneralAdministratorAuthToken()

            const response = await supertest(app)
                .post("/api/professionals")
                .send({
                    profile: ProfileType.GENERAL_LOCAL_ADMINISTRATOR,
                })
                .set({
                    api_key: apiKey,
                    authorization: authToken
                })

            expect(response.status).toEqual(400)
            expect(response.body).toEqual({
                message: "City is required for general local administrator profiles",
                data: null,
                status_code: 400,
            })
        })

        test.each([
            ProfileType.LOCAL_ADMINISTRATOR,
            ProfileType.DOCTOR,
            ProfileType.NURSE,
            ProfileType.NURSING_TECHNICIAN,
            ProfileType.ODONTOLOGIST,
            ProfileType.RECEPTIONIST,
            ProfileType.ACS,
        ])("when the health unit is required", async (profile) => {
            const authToken = await new AuthenticationBuilder().buildGeneralAdministratorAuthToken()

            const response = await supertest(app)
                .post("/api/professionals")
                .send({
                    profile: profile,
                })
                .set({
                    api_key: apiKey,
                    authorization: authToken
                })

            expect(response.status).toEqual(400)
            expect(response.body).toEqual({
                message: "Health unit is required for non-general administrator profiles",
                data: null,
                status_code: 400,
            })
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
        ])("when password is required", async (profile) => {
            const authToken = await new AuthenticationBuilder().buildGeneralAdministratorAuthToken()

            const response = await supertest(app)
                .post("/api/professionals")
                .send({
                    email: email,
                    profile: profile,
                    cityId: cityId,
                    healthUnitId: healthUnitId,
                })
                .set({
                    api_key: apiKey,
                    authorization: authToken
                })

            expect(response.status).toEqual(400)
            expect(response.body).toEqual({
                message: "Password is required.",
                data: null,
                status_code: 400,
            })
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
        ])("when email is invalid", async (profile) => {
            const authToken = await new AuthenticationBuilder().buildGeneralAdministratorAuthToken()

            const response = await supertest(app)
                .post("/api/professionals")
                .send({
                    email: "invalid_email",
                    password: password,
                    profile: profile,
                    cityId: cityId,
                    healthUnitId: healthUnitId,
                })
                .set({
                    api_key: apiKey,
                    authorization: authToken
                })

            expect(response.status).toEqual(400)
            expect(response.body).toEqual({
                message: "Invalid email.",
                data: null,
                status_code: 400,
            })
        })
    })

    describe("should return not found http response", () => {
        test("when city does not exist", async () => {
            const generalAdministratorAuthToken = await new AuthenticationBuilder().buildGeneralAdministratorAuthToken()

            const response = await supertest(app)
                .post("/api/professionals")
                .send({
                    profile: ProfileType.GENERAL_LOCAL_ADMINISTRATOR,
                    cityId: 100
                })
                .set({
                    api_key: apiKey,
                    authorization: generalAdministratorAuthToken
                })

            expect(response.status).toEqual(404)
            expect(response.body).toEqual({
                message: "City not found",
                data: null,
                status_code: 404,
            })
        })

        test.each([
            ProfileType.LOCAL_ADMINISTRATOR,
            ProfileType.DOCTOR,
            ProfileType.NURSE,
            ProfileType.NURSING_TECHNICIAN,
            ProfileType.ODONTOLOGIST,
            ProfileType.RECEPTIONIST,
            ProfileType.ACS,
        ])("when health unit does not exist", async (profile) => {
            const generalAdministratorAuthToken = await new AuthenticationBuilder().buildGeneralAdministratorAuthToken()

            const response = await supertest(app)
                .post("/api/professionals")
                .send({
                    profile: profile,
                    healthUnitId: 100
                })
                .set({
                    api_key: apiKey,
                    authorization: generalAdministratorAuthToken
                })

            expect(response.status).toEqual(404)
            expect(response.body).toEqual({
                message: "Health unit not found",
                data: null,
                status_code: 404,
            })
        })
    })

    describe("should return created http response", () => {
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
            expect(response.body).toEqual({
                message: "Created successfully",
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

        test.each([
            ProfileType.LOCAL_ADMINISTRATOR,
            ProfileType.DOCTOR,
            ProfileType.NURSE,
            ProfileType.NURSING_TECHNICIAN,
            ProfileType.ODONTOLOGIST,
            ProfileType.RECEPTIONIST,
            ProfileType.ACS,
        ])("when requester is a general local administrator and the profile is %s", async (profile) => {
            const credentials = await new ProfessionalBuilder().buildGeneralLocalAdministrator(cityId)
            const authorizationToken = await new AuthenticationBuilder()
                .withCpf(credentials.cpf)
                .withPassword(credentials.password)
                .build()

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
                    authorization: authorizationToken
                })

            expect(response.status).toEqual(201)
            expect(response.body).toEqual({
                message: "Created successfully",
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

        test.each([
            ProfileType.DOCTOR,
            ProfileType.NURSE,
            ProfileType.NURSING_TECHNICIAN,
            ProfileType.ODONTOLOGIST,
            ProfileType.RECEPTIONIST,
            ProfileType.ACS,
        ])("when requester is a local administrator and the profile is %s", async (profile) => {
            const credentials = await new ProfessionalBuilder().buildLocalAdministrator(cityId, healthUnitId)
            const authorizationToken = await new AuthenticationBuilder()
                .withCpf(credentials.cpf)
                .withPassword(credentials.password)
                .build()

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
                    authorization: authorizationToken
                })

            expect(response.status).toEqual(201)
            expect(response.body).toEqual({
                message: "Professional created and linked to health unit successfully",
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
