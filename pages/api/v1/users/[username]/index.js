import { createRouter } from "next-connect";

import controller from "infra/controller.js";
import user from "models/user.js";

const router = createRouter();

router.get(getHandler);
router.patch(patchHandler);

async function getHandler(req, res) {
  const userFounded = await user.findOneByUsername(req.query.username);
  res.status(200).json(userFounded);
}

async function patchHandler(req, res) {
  const username = req.query.username;
  const valuesToUpdate = req.body;

  const updatedUser = await user.update(username, valuesToUpdate);

  res.status(200).json(updatedUser);
}

export default router.handler(controller.errorHandlers);
