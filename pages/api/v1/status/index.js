import database from "infra/database.js";
import { InternalServerError } from "infra/errors.js";

const status = async (_req, res) => {
  try {
    const updateAt = new Date().toISOString();
    const dbName = process.env.POSTGRES_DB;

    const dbServerVersion = await database.query("SHOW server_version;");
    const serverVersion = dbServerVersion.rows[0].server_version;
    const dbMaxConnections = await database.query("SHOW  max_connections;");
    const maxConnections = dbMaxConnections.rows[0].max_connections;
    const dbOpenConnections = await database.query({
      text: "SELECT COUNT(*) FROM pg_stat_activity WHERE datname = $1;",
      values: [dbName],
    });
    const openConnections = dbOpenConnections.rows[0].count;

    return res.status(200).json({
      update_at: updateAt,
      server_version: serverVersion,
      max_connections: Number(maxConnections),
      open_connections: Number(openConnections),
    });
  } catch (error) {
    const publicErrorObject = new InternalServerError({
      cause: error,
    });

    console.log("\n Erro dentro do catch do status: \n");
    console.error(publicErrorObject);

    return res.status(500).json(publicErrorObject);
  }
};

export default status;
