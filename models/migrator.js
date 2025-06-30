import database from "infra/database.js";

import { join } from "node:path";
import migrationRunner from "node-pg-migrate";

async function listPendingMigrations() {
    let dbClient;
    try {
        dbClient = await database.getNewClient();
        const defaultMigrationsRunner = getMigrationsRunner(dbClient, true);
        const pendingMigrations = await migrationRunner(defaultMigrationsRunner);

        return pendingMigrations;
    } finally {
        await dbClient?.end();
    }
}

async function runPendingMigrations() {
    let dbClient;
    try {
        dbClient = await database.getNewClient();
        const defaultMigrationsRunner = getMigrationsRunner(dbClient, false);
        const migratedMigrations = await migrationRunner(defaultMigrationsRunner);

        return migratedMigrations;
    } finally {
        await dbClient?.end();
    }
}

function getMigrationsRunner(dbClient, dryRun) {
    const defaultMigrationsRunner = {
        dbClient,
        dryRun,
        dir: join("infra", "migrations"),
        direction: "up",
        verbose: true,
        migrationsTable: "pgmigrations",
    };

    return defaultMigrationsRunner;
}

const migrator = {
    listPendingMigrations,
    runPendingMigrations,
};

export default migrator;
