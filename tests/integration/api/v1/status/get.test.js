test("get to /status", async () => {
  const status = await fetch("http://localhost:3000/api/v1/status");
  expect(status.status).toBe(200);
});
