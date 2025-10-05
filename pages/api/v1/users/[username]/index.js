import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user.js";

const router = createRouter();

const getHandler = async (req, res) => {
  const { username } = req.query;
  const userFund = await user.findOneByUsername(username);
  return res.status(200).json(userFund);
};

router.get(getHandler);

export default router.handler(controller.errorHandler);
