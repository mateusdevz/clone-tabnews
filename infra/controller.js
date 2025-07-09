import {
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "infra/errors";

function onErrorHandler(e, req, res) {
  if (
    e instanceof ValidationError ||
    e instanceof NotFoundError ||
    e instanceof UnauthorizedError
  ) {
    return res.status(e.statusCode).json(e);
  }

  const error = new InternalServerError({
    cause: e,
  });

  return res.status(error.statusCode).json(error);
}

function onNoMatchHandler(request, response) {
  const methodNotAllowedError = new MethodNotAllowedError();
  return response
    .status(methodNotAllowedError.statusCode)
    .json(methodNotAllowedError);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
};

export default controller;
