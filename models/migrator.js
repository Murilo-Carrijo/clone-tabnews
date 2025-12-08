import { resolve } from "node:path";
import migrationRunner from "node-pg-migrate";
import database from "infra/database";

const defaultMigratinsOptions = {
  driRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  log: () => {},
  migrationsTable: "pgmigrations",
};

const listPendingMigrations = async () => {
  let dbClient;
  try {
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({
      ...defaultMigratinsOptions,
      dbClient,
    });

    return pendingMigrations;
  } finally {
    await dbClient?.end();
  }
};

const runPendingMigrations = async () => {
  let dbClient;

  try {
    dbClient = await database.getNewClient();
    const migratedMigrations = await migrationRunner({
      ...defaultMigratinsOptions,
      dbClient,
      dryRun: false,
    });
    return migratedMigrations;
  } finally {
    await dbClient?.end();
  }
};

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
