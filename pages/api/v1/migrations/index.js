import migrationRunner from "node-pg-migrate";
import { join } from "node:path";

import database from "infra/database.js";

async function migrations(request, response) {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(request.method)) {
    return response.status(405).json({
      error: `Method "${request.method}" not allowed`,
    });
  }

  let dbClient;

  try {
    dbClient = await database.getNewClient();
    const defaultMigrationsRunner = {
      dbClient,
      dryRun: true,
      dir: join("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    };

    if (request.method === "GET") {
      const pendingMigrations = await migrationRunner(defaultMigrationsRunner);
      return response.status(200).json(pendingMigrations);
    }

    if (request.method === "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationsRunner,
        dryRun: false, //executa a migration de fato
      });

      if (migratedMigrations.length > 0) {
        return response.status(201).json(migratedMigrations);
      }

      return response.status(200).json(migratedMigrations);
    }
  } catch (e) {
    console.log(e);
  } finally {
    await dbClient.end();
  }
}

export default migrations;
