import crypto from "node:crypto";
import database from "infra/database";
import { UnauthorizedError } from "infra/errors";

const EXPIRATION_IN_MILLISECONDS = 60 * 60 * 24 * 30 * 1000; // 30 Days

const renInsertQuery = async (token, userId, expiresAt) => {
  const result = await database.query({
    text: `
      INSERT INTO
        sessions (token, user_id, expires_at)
      VALUES
        ($1, $2, $3)
      RETURNING
        *
    ;`,
    values: [token, userId, expiresAt],
  });

  return result.rows[0];
};

const runSelectQuery = async (sessionToken) => {
  const result = await database.query({
    text: `
      SELECT
        *
      FROM
        sessions
      WHERE
        token = $1
        AND expires_at > NOW()
      LIMIT
        1
    ;`,
    values: [sessionToken],
  });
  if (result.rowCount === 0) {
    throw new UnauthorizedError({
      message: "Usuário não possui uma sessão ativa.",
      action: "Verifique se este usuário está logado e tente novamente.",
    });
  }

  return result.rows[0];
};

const runUpdateQuery = async (id, expiresAt) => {
  const result = await database.query({
    text: `
      UPDATE
        sessions
      SET
        expires_at = $2,
        updated_at = NOW()
      WHERE
        id = $1
      RETURNING
        *
    ;`,
    values: [id, expiresAt],
  });

  return result.rows[0];
};

const create = async (userId) => {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  const newSession = await renInsertQuery(token, userId, expiresAt);

  return newSession;
};

const findOneValidByToken = async (sessionToken) => {
  const sessionFound = await runSelectQuery(sessionToken);
  return sessionFound;
};

const renew = async (id) => {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  await runUpdateQuery(id, expiresAt);
};

const session = {
  create,
  EXPIRATION_IN_MILLISECONDS,
  findOneValidByToken,
  renew,
};

export default session;
