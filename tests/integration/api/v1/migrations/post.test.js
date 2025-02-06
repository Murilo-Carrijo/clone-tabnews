import database from "infra/database";


const cleanDatabase = async () => {
  await database.query("drop schema public cascade; create schema public;");
};

beforeAll(cleanDatabase);


test("POST to /api/v1/migrations returns 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(response.status).toBe(201);
  const responseBody = await response.json();
  expect(Array.isArray(responseBody)).toEqual(true);
  expect(responseBody.length).toBeGreaterThan(0);
  const getResponse = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(getResponse.status).toBe(200);
  const getResponseBody = await getResponse.json();
  expect(Array.isArray(responseBody)).toEqual(true);
  expect(getResponseBody.length).toEqual(0);
});
