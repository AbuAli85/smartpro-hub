import { createServer } from "http"
import { apiResolver } from "next/dist/server/api-utils/node"
import supertest from "supertest"
import handler from "../app/api/auth/signup/route"
import { describe, it, expect } from "@jest/globals"

describe("Signup API", () => {
  const server = createServer((req, res) => apiResolver(req, res, undefined, handler, {} as any, false))
  const request = supertest(server)

  it("should create a new user", async () => {
    const response = await request.post("/api/auth/signup").send({
      email: "test@example.com",
      password: "StrongPassword123!",
      userType: "business",
      crNumber: "12345",
      companyName: "Test Company",
      industry: "Technology",
      phoneNumber: "+96812345678",
    })

    expect(response.status).toBe(201)
    expect(response.body.message).toBe("User created successfully. Please verify your email and phone number.")
  })

  it("should return an error for invalid input", async () => {
    const response = await request.post("/api/auth/signup").send({
      email: "invalid-email",
      password: "weak",
      userType: "unknown",
    })

    expect(response.status).toBe(400)
    expect(response.body.error).toBeTruthy()
  })
})

