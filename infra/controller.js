import { InternalServerError, MethodNotAllowedError } from 'infra/errors';

function onErrorHandler(e, req, res) {
    const error = new InternalServerError({
        cause: e,
        statusCode: e.statusCode
    });

    console.error("Erro do next-connect ", error)
    return res.status(error.statusCode).json(error);
}

function onNoMatchHandler(request, response) {
    const methodNotAllowedError = new MethodNotAllowedError();
    return response.status(methodNotAllowedError.statusCode)
        .json(methodNotAllowedError);
}

const controller = {
    errorHandlers: {
        onNoMatch: onNoMatchHandler,
        onError: onErrorHandler,
    }
};

export default controller;
