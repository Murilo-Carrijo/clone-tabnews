import retry from "async-retry";
import database from "infra/database";

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

const orchestrator = {
  waitForAllServices,
  clearDatabase,
};

export default orchestrator;
