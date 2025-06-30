import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("POST /api/v1/status", () => {
  describe("Anonymous Users", () => {
    test("Retriving status information", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status", {
        method: 'POST'
      });

      expect(response.status).toBe(405);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "MethodNotAllowedError",
        message: "Método não permitido para esse endpoint.",
        action: "Verifique se o método HTTP enviado é valido para esse endpoint.",
        statusCode: 405,
      });
    });
  });
});
