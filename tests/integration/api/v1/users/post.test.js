import { version as uuidVersion } from "uuid";
import password from "models/password";
import orchestrator from "tests/orchestrator.js";
import user from "models/user.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "mateuz.dev123",
          email: "mateus@gmail.com",
          password: "teste123",
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBe(NaN);
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "mateuz.dev123",
        email: "mateus@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      const userInDb = await user.findOneByUsername("mateuz.dev123");
      const passwordComparisionResultMatch = await password.compare("teste123", userInDb.password);
      expect(passwordComparisionResultMatch).toBe(true);

      const passwordComparisionResultNotMatch = await password.compare("senhaerrada", userInDb.password);
      expect(passwordComparisionResultNotMatch).toBe(false);
    });

    test("With duplicated email", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "mateuz.dev3",
          email: "mateus2@gmail.com",
          password: "teste123",
        }),
      });

      expect(response.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "mateuz.dev1",
          email: "mateus2@gmail.com",
          password: "teste123",
        }),
      });

      expect(response2.status).toBe(400);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar o cadastrado.",
        status_code: 400,
      });
    });

    test("With duplicated username", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "mateuz.dev543",
          email: "mateus10@gmail.com",
          password: "teste123",
        }),
      });

      expect(response.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "mateuz.dev543",
          email: "mateus11@gmail.com",
          password: "teste123",
        }),
      });

      expect(response2.status).toBe(400);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar o cadastrado.",
        status_code: 400,
      });
    });
  });
});
