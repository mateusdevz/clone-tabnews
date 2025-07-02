import { createRouter } from 'next-connect';

import controller from 'infra/controller.js'
import user from 'models/user.js';

const router = createRouter();

router.get(getHandler);

async function getHandler(req, res) {
    const userFounded = await user.findOneByUsername(req.query.username);
    res.status(200).json(userFounded);
}

export default router.handler(controller.errorHandlers);
