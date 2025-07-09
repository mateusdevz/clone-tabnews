import user from "models/user.js";
import passwordModel from "models/password.js";

import { NotFoundError, UnauthorizedError } from "infra/errors";

async function getAuthenticatedUser(email, password) {
  try {
    const storedUser = await findUserByEmail(email);
    await validatePassword(password, storedUser.password);
    return storedUser;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Dados de autenticação não conferem",
        action: "Verifique se os dados estão corretos",
      });
    }

    throw error;
  }

  async function findUserByEmail(email) {
    let storedUser;
    try {
      storedUser = await user.findOneByEmail(email);
      return storedUser;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: "Dados de autenticação não conferem",
          action: "Verifique se os dados estão corretos",
        });
      }

      throw error;
    }
  }

  async function validatePassword(password, storedUserPassword) {
    const isPasswordCorret = await passwordModel.compare(
      password,
      storedUserPassword,
    );

    if (!isPasswordCorret) {
      throw new UnauthorizedError({
        message: "Dados de autenticação não conferem",
        action: "Verifique se os dados estão corretos",
      });
    }
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
