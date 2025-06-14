import database from "infra/database";
import orchestrator from "tests/orchestrator.js";

async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  cleanDatabase();
});

test("post to /migrations", async () => {
  const response = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(response.status).toBe(201);

  const responseBody = await response.json();

  expect(Array.isArray(responseBody)).toBe(true);
  expect(responseBody.length).toBeGreaterThan(0);

  const response2 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });

  const responseBody2 = await response2.json();
  expect(response2.status).toBe(200);
  expect(responseBody2.length).toBe(0);
});
