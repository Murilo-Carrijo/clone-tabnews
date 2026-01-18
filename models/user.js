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
      action: "Utilize outro nome de usuario ou email para esta operação.",
    });
  }
};

const hashPasswordInObject = async (userInputValues) => {
  const hashedPassword = await password.hash(userInputValues.password);
  userInputValues.password = hashedPassword;
};

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

const findOneByEmail = async (email) => {
  const userFound = await runSelectQueryEmail(email);
  return userFound;
};

const runSelectQueryEmail = async (email) => {
  const user = await database.query({
    text: `
      SELECT
        *
      FROM
        users
      WHERE
        LOWER(email) = LOWER($1)
      LIMIT
        1
      ;`,
    values: [email],
  });
  if (user.rowCount === 0) {
    throw new NotFoundError({
      message: "O email informado não foi encontrado no sistema.",
      action: "Verifique se o email está digitado corretamente.",
    });
  }
  return user.rows[0];
};

const runUpdateQuery = async (userWithNewValues) => {
  const results = await database.query({
    text: `
      UPDATE
        users
      SET
        username= $2,
        email = $3,
        password = $4,
        updated_at = timezone('utc', now())
      WHERE
        id = $1
      RETURNING
        *
    `,
    values: [
      userWithNewValues.id,
      userWithNewValues.username,
      userWithNewValues.email,
      userWithNewValues.password,
    ],
  });

  return results.rows[0];
};

const update = async (username, userInputValues) => {
  const currentUser = await findOneByUsername(username);
  const checkUsername =
    "username" in userInputValues && username != userInputValues.username;
  const checkEmail =
    "email" in userInputValues && currentUser.email != userInputValues.email;
  if (checkUsername || checkEmail) {
    await validateUniqUser(userInputValues);
  }

  if ("password" in userInputValues) {
    await hashPasswordInObject(userInputValues);
  }

  const userWithNewValues = {
    ...currentUser,
    ...userInputValues,
  };

  const updateUser = await runUpdateQuery(userWithNewValues);
  return updateUser;
};

const findOneById = async (id) => {
  const userFound = await runSelectByIdQuery(id);
  return userFound;
};

const runSelectByIdQuery = async (id) => {
  const user = await database.query({
    text: `
      SELECT
        *
      FROM
        users
      WHERE
        id = $1
      LIMIT
        1
      ;`,
    values: [id],
  });
  if (user.rowCount === 0) {
    throw new NotFoundError({
      message: "O id informado não foi encontrado no sistema.",
      action: "Verifique se o id está digitado corretamente.",
    });
  }
  return user.rows[0];
};

const user = {
  create,
  findOneByUsername,
  findOneByEmail,
  update,
  findOneById,
};

export default user;
