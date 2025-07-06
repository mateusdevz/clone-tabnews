import { version as uuidVersion } from "uuid";

import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With exact case match", async () => {
      const user = await orchestrator.createUser({
        username: "MesmoCase",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/MesmoCase",
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBe(NaN);
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "MesmoCase",
        email: user.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
    });

    test("With exact case mismatch", async () => {
      const user = await orchestrator.createUser({
        username: "CaseDiferente",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/casediferente",
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBe(NaN);
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "CaseDiferente",
        email: user.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
    });

    test("With non existent username", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/mateuzininexistente",
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Usuário não encontrado na base.",
        action: "Use informações de usuários já cadastrados na base.",
        status_code: 404,
      });
    });
  });
});
