import { createRouter } from 'next-connect';
import controller from 'infra/controller.js';

import migrationRunner from "node-pg-migrate";
import { join } from "node:path";

import database from "infra/database.js";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(
  controller.errorHandlers
);

async function getHandler(request, response) {
  let dbClient = await database.getNewClient();
  const defaultMigrationsRunner = getMigrationsRunner(dbClient);

  const pendingMigrations = await migrationRunner(defaultMigrationsRunner);
  dbClient.end();
  return response.status(200).json(pendingMigrations);
}

async function postHandler(request, response) {
  let dbClient = await database.getNewClient();
  const defaultMigrationsRunner = getMigrationsRunner(dbClient);

  const migratedMigrations = await migrationRunner({
    ...defaultMigrationsRunner,
    dryRun: false, //executa a migration de fato
  });

  dbClient.end();

  if (migratedMigrations.length > 0) {
    return response.status(201).json(migratedMigrations);
  }

  return response.status(200).json(migratedMigrations);
}

function getMigrationsRunner(dbClient) {
  const defaultMigrationsRunner = {
    dbClient,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };

  return defaultMigrationsRunner;
}
