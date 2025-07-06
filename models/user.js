import database from "infra/database.js";
import password from "models/password.js";
import { NotFoundError, ValidationError } from "infra/errors";

async function create(user) {
  await validateUniqueEmail(user.email);
  await validateUniqueUsername(user.username);
  await hashPasswordInObject(user);

  const newUser = await runInsertQuery(user);
  return newUser;

  async function runInsertQuery(userInput) {
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

async function update(username, valuesToUpdate) {
  const currentUser = await findOneByUsername(username);
  if ("email" in valuesToUpdate) {
    await validateUniqueEmail(valuesToUpdate.email);
    runUpdateQuery(username, valuesToUpdate);
  }

  if ("username" in valuesToUpdate) {
    await validateUniqueUsername(valuesToUpdate.username);
    runUpdateQuery(username, valuesToUpdate);
  }

  if ("password" in valuesToUpdate) {
    await hashPasswordInObject(valuesToUpdate);
    runUpdateQuery(username, valuesToUpdate);
  }

  const updatedUser = {
    ...currentUser,
    ...valuesToUpdate,
  };

  const updatedUserInDb = await runUpdateQuery(updatedUser);

  return updatedUserInDb;

  async function runUpdateQuery(updatedUser) {
    const results = await database.query({
      text: `
        UPDATE
          users
        SET
          username = $2,
          email = $3,
          password = $4,
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
      `,
      values: [
        updatedUser.id,
        updatedUser.username,
        updatedUser.email,
        updatedUser.password,
      ],
    });

    return results.rows[0];
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
      action: "Utilize outro username para esta operação.",
    });
  }
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
      action: "Utilize outro email para realizar esta operacao.",
    });
  }
}

async function hashPasswordInObject(user) {
  const hash = await password.hash(user.password);
  user.password = hash;
}

const user = {
  create,
  findOneByUsername,
  update,
};

export default user;
