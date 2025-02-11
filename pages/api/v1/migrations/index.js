import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

const migrations = async (req, res) => {
  const dbClient = await database.getNewClient();
  const defaultMigratinsOptions = {
    dbClient: dbClient,
    driRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  }

  if (req.method === "GET") {
    const pendingMigrations = await migrationRunner(defaultMigratinsOptions);
    await dbClient.end();
    return res.status(200).json(pendingMigrations);
  }

  if (req.method === "POST") {
    const migratedMigrations = await migrationRunner({
      ...defaultMigratinsOptions,
      dryRun: false,
    });

    await dbClient.end();

    if (migratedMigrations.length > 0) {
      return res.status(201).json(migratedMigrations);
    }
    return res.status(200).json(migratedMigrations);

  }
  return res.status(405).end();

};


export default migrations;
