import crypto from "node:crypto";
import database from "infra/database.js";

const EXPIRATION_IN_MILLISECONDS = 60 * 60 * 24 * 30 * 1000; // 60 segundos * 60 minutos * 24 horas * 30 dias * conversao para milisegundos

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex"); // o randomBytes gera um buffer que é convertido em hexadecimal

  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS); // hoje mais 30 dias
  const newSession = await runInsertQuery(token, userId, expiresAt);
  return newSession;

  async function runInsertQuery(token, userId, expiresAt) {
    const results = await database.query({
      text: `
        INSERT INTO
          sessions (token, user_id, expires_at)
        VALUES
          ($1, $2, $3)
        RETURNING
          *
      ;`,
      values: [token, userId, expiresAt],
    });

    return results.rows[0];
  }
}

const session = {
  create,
  EXPIRATION_IN_MILLISECONDS,
};

export default session;
