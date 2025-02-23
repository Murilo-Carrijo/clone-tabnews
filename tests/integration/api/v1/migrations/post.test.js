import orchestrator from "tests/orchestrator";
import database from "infra/database";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await database.query("drop schema public cascade; create schema public;");
});

describe("POST /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    describe("Runnig pending migrations", () => {
      test("For the first time", async () => {
        const response = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "POST",
      });
        expect(response.status).toBe(201);
        const responseBody = await response.json();
        expect(Array.isArray(responseBody)).toEqual(true);
        expect(responseBody.length).toBeGreaterThan(0);
      });
      test("For the second time", async () => {
        const getResponse = await fetch("http://localhost:3000/api/v1/migrations", {
          method: "POST",
        });
        expect(getResponse.status).toBe(200);
        const getResponseBody = await getResponse.json();
        expect(Array.isArray(getResponseBody)).toEqual(true);
        expect(getResponseBody.length).toEqual(0);
      });
    });
  });
 });
