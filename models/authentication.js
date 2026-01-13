import user from "models/user.js";
import password from "models/password.js";
import { NotFoundError, UnauthorizedError } from "infra/errors";

const findOneUserByEmail = async (providedEmail) => {
  try {
    const storedUser = await user.findOneByEmail(providedEmail);
    return storedUser;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new UnauthorizedError({
        message: "Email nao confere.",
        action: "Verifique se este dado esta correto.",
      });
    }
    throw error;
  }
};

const validatePassword = async (providedPassword, storedUserPassword) => {
  const correctPasswordMatch = await password.compare(
    providedPassword,
    storedUserPassword,
  );
  if (!correctPasswordMatch) {
    throw new UnauthorizedError({
      message: "Senha nao confere.",
      action: "Verifique se este dado esta correto.",
    });
  }
};

const getAutenticateUser = async (providedEmail, providedPassword) => {
  try {
    const storedUser = await findOneUserByEmail(providedEmail);
    const { password, ...user } = storedUser;

    await validatePassword(providedPassword, password);

    return user;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Dados de autenticação nao conferem.",
        action: "Verifique se os dados enviados estao corretos.",
      });
    }
    throw error;
  }
};

const authentication = {
  getAutenticateUser,
};

export default authentication;
