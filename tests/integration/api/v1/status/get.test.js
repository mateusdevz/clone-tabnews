import orchestrator from "tests/orchestrator.js";

beforeAll(async() => {
  await orchestrator.waitForAllServices();
});

test("get to /status", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);

  const responseBody = await response.json();

  expect(responseBody.dependencies.database.version).toBe('16.0')
  expect(responseBody.dependencies.database.max_connections).toBe(100)
  expect(responseBody.dependencies.database.opened_connections).toBe(1)
});
 