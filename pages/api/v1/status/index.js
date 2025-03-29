import database from 'infra/database.js'

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const dbVersion = await database.query('SHOW server_version;');
  const dbMaxConnections = await database.query('SHOW max_connections;');
  const dbMaxConnectionsValue = dbMaxConnections.rows[0].max_connections;

  const dbName = process.env.POSTGRES_DB;
  const dbActiveConnections = await database.query({
    text: `SELECT count(*)::int from pg_stat_activity WHERE datname = $1;`,
    values: [dbName]
  });
  console.log(dbActiveConnections.rows);

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: { 
        version: dbVersion.rows[0].server_version,
        max_connections: parseInt(dbMaxConnectionsValue),
        opened_connections: dbActiveConnections.rows[0].count
      }
    }
  });
}
 
export default status;
