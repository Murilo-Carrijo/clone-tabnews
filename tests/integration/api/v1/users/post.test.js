import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";
import user from "models/user";
import password from "models/password";
import dotenv from "dotenv";
dotenv.config();

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("Whit unique and valid data", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "murilohcpaulino",
          email: "murilocarrijoadm@test.com",
          password: "123456",
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "murilohcpaulino",
        email: "murilocarrijoadm@test.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const userInDatabase = await user.findOneByUsername("murilohcpaulino");
      const correctPasswordMatch = await password.compare(
        `123456${process.env.PEPPER}`,
        userInDatabase.password,
      );
      expect(correctPasswordMatch).toBe(true);

      const incorrectPasswordMatch = await password.compare(
        "1234568910",
        userInDatabase.password,
      );
      expect(incorrectPasswordMatch).toBe(false);
    });

    test("Whit duplicated 'email'", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "duplicateemail1",
          email: "duplicate@test.com",
          password: "123456",
        }),
      });

      expect(response.status).toBe(201);

      const responseDuplicate = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "duplicateemail2",
            email: "duplicate@test.com",
            password: "123456",
          }),
        },
      );

      expect(responseDuplicate.status).toBe(400);

      const responseBody = await responseDuplicate.json();

      expect(responseBody).toEqual({
        status_code: 400,
        name: "ValidationError",
        message: "O nome de usuario ou email informado ja esta sendo utilizado",
        action: "Utilize outro nome de usuario ou email para esta operação.",
      });
    });

    test("Whit duplicated 'username'", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "duplicateemail",
          email: "duplicate@testt.com",
          password: "123456",
        }),
      });

      expect(response.status).toBe(201);

      const responseDuplicate = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "duplicateemail",
            email: "duplicate@testt.com",
            password: "123456",
          }),
        },
      );

      expect(responseDuplicate.status).toBe(400);

      const responseBody = await responseDuplicate.json();

      expect(responseBody).toEqual({
        status_code: 400,
        name: "ValidationError",
        message: "O nome de usuario ou email informado ja esta sendo utilizado",
        action: "Utilize outro nome de usuario ou email para esta operação.",
      });
    });
  });
});
