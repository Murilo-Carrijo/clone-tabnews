import retry from "async-retry";
import { faker } from "@faker-js/faker/.";
import database from "infra/database";
import migrator from "models/migrator";
import user from "models/user";

const waitForAllServices = async () => {
  const waitForWebServices = async () => {
    const fetchStatusPage = async () => {
      const response = await fetch("http://localhost:3000/api/v1/status");
      if (response.status !== 200) {
        throw new Error("Service is not ready yet");
      }
    };
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });
  };
  await waitForWebServices();
};

const clearDatabase = async () => {
  await database.query("drop schema public cascade; create schema public;");
};

const runPendingMigrations = async () => {
  await migrator.runPendingMigrations();
};

const createUser = async (userObject = {}) => {
  return await user.create({
    username:
      userObject.username || faker.internet.username().replace(/[_.-]/g, ""),
    email: userObject.email || faker.internet.email(),
    password: userObject.password || "validpassword",
  });
};

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
};

export default orchestrator;
