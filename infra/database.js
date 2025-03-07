import { Client } from "pg";
import { ServiceError } from "./errors";

const query = async (queryObject) => {
  let client;
  try {
    client = await getNewClient();
    const res = await client.query(queryObject);
    return res;
  } catch (error) {
    const serviceErrorObject = new ServiceError({
      message: "Erro na conexão com Banco ou Query.",
      cause: error,
    });
    throw serviceErrorObject;
  } finally {
    await client?.end();
  }
};

const getNewClient = async () => {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: process.env.NODE_ENV === "production" ? true : false,
  });

  await client.connect();
  return client;
};

const database = {
  query,
  getNewClient,
};

export default database;
