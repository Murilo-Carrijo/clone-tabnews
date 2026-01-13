import { createRouter } from "next-connect";
import * as cookie from "cookie";
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

  const setCookie = cookie.serialize("session_id", newSession.token, {
    path: "/",
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
  res.setHeader("Set-Cookie", setCookie);

  return res.status(201).json(newSession);
};

router.post(postHandler);

export default router.handler(controller.errorHandler);
