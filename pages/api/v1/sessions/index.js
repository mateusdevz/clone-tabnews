import { createRouter } from "next-connect";
import * as cookie from "cookie";

import controller from "infra/controller.js";
import session from "models/session.js";
import authentication from "models/authentication.js";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const sessionRequest = request.body;
  const authenticatedUser = await authentication.getAuthenticatedUser(
    sessionRequest.email,
    sessionRequest.password,
  );

  const newSession = await session.create(authenticatedUser.id);

  const setCookie = cookie.serialize("session_id", newSession.token, {
    path: "/",
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
    secure: process.env.NODE_ENV === "production" ? true : false, // em producao poderá ser trafegado apenas com https,
    httpOnly: true, // via clientside nao é possivel capturar(usando o browser)
  });

  response.setHeader("Set-Cookie", setCookie);
  response.status(201).json(newSession);
}
