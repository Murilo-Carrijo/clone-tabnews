import { createRouter } from "next-connect";
import controller from "infra/controller";
import authentication from "models/authentication.js";
import session from "models/session";

const router = createRouter();

const postHandler = async (req, res) => {
  const userInputValues = req.body;
  const autenticatedUser = await authentication.getAutenticateUser(
    userInputValues.email,
    userInputValues.password,
  );

  const newSession = await session.create(autenticatedUser.id);

  controller.setSessionCookie(newSession.token, res);

  return res.status(201).json(newSession);
};

router.post(postHandler);

export default router.handler(controller.errorHandler);
