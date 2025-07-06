import { version as uuidVersion } from "uuid";

import orchestrator from "tests/orchestrator.js";
import password from "models/password";
import user from "models/user.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("Updating a username that not exists", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users/nome", {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: "teste123",
        }),
      });

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Usuário não encontrado na base.",
        action: "Use informações de usuários já cadastrados na base.",
        status_code: 404,
      });
    });

    test("With duplicated 'username'", async () => {
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "mateuz.dev1",
          email: "mateus.dev1@gmail.com",
          password: "teste123",
        }),
      });

      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "mateuz.dev2",
          email: "mateus.dev2@gmail.com",
          password: "teste123",
        }),
      });

      const response = await fetch("http://localhost:3000/api/v1/users/mateuz.dev2", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "mateuz.dev1",
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para esta operação.",
        status_code: 400,
      });
    });

    test("With duplicated 'email'", async () => {
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "mateuz.dev1123123",
          email: "mateusdev1123123.dev1@gmail.com",
          password: "teste123",
        }),
      });

      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "mateuz.5345342",
          email: "mateusdev1123123.dev2@gmail.com",
          password: "teste123",
        }),
      });

      const response = await fetch("http://localhost:3000/api/v1/users/mateuz.5345342", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "mateusdev1123123.dev1@gmail.com",
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta operacao.",
        status_code: 400,
      });
    });

    test("With unique 'username'", async () => {
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "mateuz.sucesso",
          email: "mateus.sucesso@gmail.com",
          password: "teste123",
        }),
      });

      const response = await fetch("http://localhost:3000/api/v1/users/mateuz.sucesso", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "mateuz.sucesso2",
        }),
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "mateuz.sucesso2",
        email: "mateus.sucesso@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.updated_at)).not.toBe(NaN);

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With unique 'email'", async () => {
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "mateuz.sucesso123",
          email: "mateus.sucesso123@gmail.com",
          password: "teste123",
        }),
      });

      const response = await fetch("http://localhost:3000/api/v1/users/mateuz.sucesso123", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "mateus.sucesso321@gmail.com",
        }),
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "mateuz.sucesso123",
        email: "mateus.sucesso321@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.updated_at)).not.toBe(NaN);

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With new password", async () => {
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "mateuz.password",
          email: "mateus.password@gmail.com",
          password: "password",
        }),
      });

      const response = await fetch("http://localhost:3000/api/v1/users/mateuz.password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: "password123",
        }),
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "mateuz.password",
        email: "mateus.password@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.updated_at)).not.toBe(NaN);

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDb = await user.findOneByUsername("mateuz.password");
      const passwordComparisionResultMatch = await password.compare("password123", userInDb.password);
      expect(passwordComparisionResultMatch).toBe(true);

      const passwordComparisionResultNotMatch = await password.compare("senhaerrada", userInDb.password);
      expect(passwordComparisionResultNotMatch).toBe(false);
    });
  });
});
