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

describe("PATCH  /api/v1/users/[username]", () => {
  const url = "http://localhost:3000/api/v1/users";
  describe("Anonymous user", () => {
    test("Whit nonexistent 'username'", async () => {
      const getResponse = await fetch(`${url}/UsuarioInexistente`, {
        method: "PATCH",
      });

      expect(getResponse.status).toBe(404);

      const getResponseBody = await getResponse.json();

      expect(getResponseBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique se o username está digitado corretamente.",
        status_code: 404,
      });
    });

    test("Whit duplicated 'username'", async () => {
      await orchestrator.createUser({
        username: "user1",
      });

      await orchestrator.createUser({
        username: "user2",
      });

      const responseDuplicate = await fetch(
        "http://localhost:3000/api/v1/users/user2",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "user1",
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

    test("Whit duplicated 'email'", async () => {
      await orchestrator.createUser({
        email: "email1@testt.com",
      });

      const createdUser2 = await orchestrator.createUser({
        email: "email2@testt.com",
      });

      const responseDuplicate = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "email1@testt.com",
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

    test("Whit unique 'username'", async () => {
      const createdUser1 = await orchestrator.createUser({
        username: "uniqueUser1",
      });

      const updatedUser = await fetch(
        "http://localhost:3000/api/v1/users/uniqueUser1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueUser2",
          }),
        },
      );

      expect(updatedUser.status).toBe(200);

      const responseBody = await updatedUser.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueUser2",
        email: createdUser1.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("Whit unique 'email'", async () => {
      const createdUniqueEmail1 = await orchestrator.createUser();

      const updatedUser = await fetch(
        `http://localhost:3000/api/v1/users/${createdUniqueEmail1.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "uniqueEmail2@test.com",
          }),
        },
      );

      expect(updatedUser.status).toBe(200);

      const responseBody = await updatedUser.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: createdUniqueEmail1.username,
        email: "uniqueEmail2@test.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("Whit new 'password'", async () => {
      const creatednNewPassword1 = await orchestrator.createUser();

      const updatedUser = await fetch(
        `http://localhost:3000/api/v1/users/${creatednNewPassword1.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "newPassword2",
          }),
        },
      );

      expect(updatedUser.status).toBe(200);

      const responseBody = await updatedUser.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: creatednNewPassword1.username,
        email: creatednNewPassword1.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername(
        creatednNewPassword1.username,
      );
      const correctPasswordMatch = await password.compare(
        `newPassword2`,
        userInDatabase.password,
      );
      expect(correctPasswordMatch).toBe(true);

      const incorrectPasswordMatch = await password.compare(
        `newPassword1${process.env.PEPPER}`,
        userInDatabase.password,
      );
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
