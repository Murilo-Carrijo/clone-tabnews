import database from "infra/database";
import password from "models/password.js";
import { NotFoundError, ValidationError } from "infra/errors";

const runInsertQuery = async (userInputValues) => {
  const { username, email, password } = userInputValues;

  const newUser = await database.query({
    text: `
      INSERT INTO
        users (username, email, password)
      VALUES
        ($1, $2, $3)
      RETURNING
        *
      ;`,
    values: [username, email, password],
  });

  return newUser;
};

const validateUniqUser = async (userInputValues) => {
  const { username, email } = userInputValues;
  const user = await database.query({
    text: `
      SELECT
        *
      FROM
        users
      WHERE
        LOWER(username) = LOWER($1)
        OR
        LOWER(email) = LOWER($2)
      ;`,
    values: [username, email],
  });

  if (user.rowCount > 0) {
    throw new ValidationError({
      message: "O nome de usuario ou email informado ja esta sendo utilizado",
      action: "Utilize outro nome de usuario ou email para realizar o cadastro",
    });
  }
};

const hashPasswordInObject = async (userInputValues) => {
  const hashedPassword = await password.hash(userInputValues.password);
  userInputValues.password = hashedPassword;
}

const create = async (userInputValues) => {
  await validateUniqUser(userInputValues);
  await hashPasswordInObject(userInputValues);
  const newUser = await runInsertQuery(userInputValues);

  return newUser.rows[0];
};

const findOneByUsername = async (username) => {
  const userFound = await runSelectQuery(username);
  return userFound;
};

const runSelectQuery = async (username) => {
  const user = await database.query({
    text: `
      SELECT
        *
      FROM
        users
      WHERE
        LOWER(username) = LOWER($1)
      LIMIT
        1
      ;`,
    values: [username],
  });
  if (user.rowCount === 0) {
    throw new NotFoundError({
      message: "O username informado não foi encontrado no sistema.",
      action: "Verifique se o username está digitado corretamente.",
    });
  }
  return user.rows[0];
};

const user = {
  create,
  findOneByUsername,
};

export default user;
