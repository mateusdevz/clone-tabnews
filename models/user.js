import database from "infra/database.js";
import { NotFoundError, ValidationError } from "infra/errors";

async function create(user) {
  await validateUniqueEmail(JSON.parse(user).email);
  await validateUniqueUsername(JSON.parse(user).username);

  const newUser = await runInsertQuery(user);
  return newUser;

  async function runInsertQuery(user) {
    const userInput = JSON.parse(user);

    const results = await database.query({
      text: `
                INSERT INTO 
                    users (username, email, password) 
                VALUES 
                    ($1, $2, $3)
                RETURNING
                    *
                ;`,
      values: [userInput.username, userInput.email, userInput.password],
    });

    return results.rows[0];
  }

  async function validateUniqueEmail(email) {
    const results = await database.query({
      text: `
                SELECT
                    email 
                FROM
                    users
                WHERE
                    LOWER(email) = LOWER($1);
                ;`,
      values: [email],
    });

    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar o cadastrado.",
      });
    }
  }

  async function validateUniqueUsername(username) {
    const results = await database.query({
      text: `
                SELECT
                    username
                FROM
                    users
                WHERE
                    LOWER(username) = LOWER($1);
                `,
      values: [username],
    });

    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar o cadastrado.",
      });
    }
  }
}

async function findOneByUsername(username) {
  const userFounded = await runSelectQuery(username);
  return userFounded;

  async function runSelectQuery(username) {
    const result = await database.query({
      text: `
        SELECT
          *
        FROM users
        WHERE
          LOWER(username) = LOWER($1)
        LIMIT
          1
      `,
      values: [username],
    });

    if (!result.rows[0]) {
      throw new NotFoundError({
        message: "Usuário não encontrado na base.",
        action: "Use informações de usuários já cadastrados na base.",
      });
    }

    return result.rows[0];
  }
}

const user = {
  create,
  findOneByUsername,
};

export default user;
