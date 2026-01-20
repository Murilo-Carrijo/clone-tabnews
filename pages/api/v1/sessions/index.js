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

const deleteHandler = async (req, res) => {
  const sessionToken = req.cookies.session_id;
  const sessionObject = await session.findOneValidByToken(sessionToken);

  const expiredSesssion = await session.expireById(sessionObject.id);

  controller.clearSessionCookie(res);

  return res.status(200).json(expiredSesssion);
};

router.post(postHandler);
router.delete(deleteHandler);

export default router.handler(controller.errorHandler);
