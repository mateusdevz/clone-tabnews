import retry from "async-retry";
import { faker } from "@faker-js/faker";

import database from "infra/database.js";
import migrator from "models/migrator";
import user from "models/user.js";

async function waitForAllServices() {
  await waitForWebService();

  async function waitForWebService() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");
      if (response.status !== 200) {
        throw Error();
      }
    }
  }
}

async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(userObject) {
  return await user.create({
    username:
      userObject?.username ||
      faker.internet
        .username()
        .replace("-", "")
        .replace(".", "")
        .replace("_", ""),
    email: userObject?.email || faker.internet.email(),
    password: userObject?.password || "validpassword",
  });
}

const orchestrator = {
  waitForAllServices,
  cleanDatabase,
  runPendingMigrations,
  createUser,
};

export default orchestrator;
