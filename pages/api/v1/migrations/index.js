import { createRouter } from "next-connect";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";
import controller from "infra/controller";

const router = createRouter();

const openConnectionMiddleware = async (req, res, next) => {
  let dbClient = await database.getNewClient();
  const defaultMigratinsOptions = {
    dbClient: dbClient,
    driRun: true,
    dir: resolve("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };
  req.dbClient = dbClient;
  req.defaultMigratinsOptions = defaultMigratinsOptions;
  next();
};

const getHendler = async (req, res) => {
  const defaultMigratinsOptions = req.defaultMigratinsOptions;
  const pendingMigrations = await migrationRunner(defaultMigratinsOptions);
  return res.status(200).json(pendingMigrations);
};

const postHandler = async (req, res) => {
  const defaultMigratinsOptions = req.defaultMigratinsOptions;

  const migratedMigrations = await migrationRunner({
    ...defaultMigratinsOptions,
    dryRun: false,
  });

  if (migratedMigrations.length > 0) {
    return res.status(201).json(migratedMigrations);
  }
  return res.status(200).json(migratedMigrations);
};

const closeDbClientMiddleware = async (req, res, next) => {
  res.on("finish", async () => {
    if (req.dbClient) {
      await req.dbClient.end();
      req.dbClient = null;
    }
  });
  next();
};

router
  .use(openConnectionMiddleware)
  .use(closeDbClientMiddleware)
  .get(getHendler)
  .post(postHandler);

export default router.handler(controller.errorHandler);
