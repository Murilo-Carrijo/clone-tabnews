import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  const url = "http://localhost:3000/api/v1/users";
  describe("Anonymous user", () => {
    test("Whit exact case match", async () => {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "MesmoCase",
          email: "mesmo.case@test.com",
          password: "123456",
        }),
      });

      expect(response.status).toBe(201);

      const getResponse = await fetch(`${url}/MesmoCase`);

      expect(getResponse.status).toBe(200);

      const getResponseBody = await getResponse.json();

      expect(getResponseBody).toEqual({
        id: getResponseBody.id,
        username: "MesmoCase",
        email: "mesmo.case@test.com",
        password: getResponseBody.password,
        created_at: getResponseBody.created_at,
        updated_at: getResponseBody.updated_at,
      });

      expect(uuidVersion(getResponseBody.id)).toBe(4);
      expect(Date.parse(getResponseBody.created_at)).not.toBeNaN();
      expect(Date.parse(getResponseBody.updated_at)).not.toBeNaN();
    });

    test("Whit case mismatch", async () => {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "CaseDiferente",
          email: "case.diferente@test.com",
          password: "123456",
        }),
      });

      expect(response.status).toBe(201);

      const getResponse = await fetch(`${url}/casediferente`);

      expect(getResponse.status).toBe(200);

      const getResponseBody = await getResponse.json();

      expect(getResponseBody).toEqual({
        id: getResponseBody.id,
        username: "CaseDiferente",
        email: "case.diferente@test.com",
        password: getResponseBody.password,
        created_at: getResponseBody.created_at,
        updated_at: getResponseBody.updated_at,
      });

      expect(uuidVersion(getResponseBody.id)).toBe(4);
      expect(Date.parse(getResponseBody.created_at)).not.toBeNaN();
      expect(Date.parse(getResponseBody.updated_at)).not.toBeNaN();
    });

    test("Whit nonexistent username", async () => {
      const getResponse = await fetch(`${url}/UsuarioInexistente`);

      expect(getResponse.status).toBe(404);

      const getResponseBody = await getResponse.json();

      expect(getResponseBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique se o username está digitado corretamente.",
        status_code: 404,
      });
    });
  });
});
