import { createRouter } from 'next-connect';

import database from "infra/database.js";
import controller from 'infra/controller.js';

const router = createRouter();

router.get(getHandler);

export default router.handler(
  controller.errorHandlers
);

async function getHandler(request, response) {
  const updatedAt = new Date().toISOString();
  const dbVersion = await database.query("SHOW server_version;");
  const dbMaxConnections = await database.query("SHOW max_connections;");
  const dbMaxConnectionsValue = dbMaxConnections.rows[0].max_connections;

  const dbName = process.env.POSTGRES_DB;
  const dbActiveConnections = await database.query({
    text: `SELECT count(*)::int from pg_stat_activity WHERE datname = $1;`,
    values: [dbName],
  });

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: dbVersion.rows[0].server_version,
        max_connections: parseInt(dbMaxConnectionsValue),
        opened_connections: dbActiveConnections.rows[0].count,
      },
    },
  });
}
