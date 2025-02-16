import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

test("GET to /api/v1/status returns 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);

  const responseBody = JSON.parse(await response.text());
  expect(responseBody.update_at).toBeDefined();
  expect(responseBody.server_version).toBeDefined();
  expect(responseBody.max_connections).toBeDefined();

  const parserUpdateAt = new Date(responseBody.update_at).toISOString();
  expect(responseBody.update_at).toEqual(parserUpdateAt);
  expect(responseBody.server_version).toEqual("16.0");
  expect(responseBody.max_connections).toEqual(100);
  expect(responseBody.open_connections).toEqual(1);
});
