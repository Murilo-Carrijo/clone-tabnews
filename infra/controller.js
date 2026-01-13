import {
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
} from "infra/errors.js";

const onNoMatchHandler = async (_req, res) => {
  const errorObject = new MethodNotAllowedError();
  return res.status(errorObject.statusCode).json(errorObject);
};

const onErrorHandler = async (error, _req, res) => {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof UnauthorizedError
  ) {
    return res.status(error.statusCode).json(error);
  }
  const publicErrorObject = new InternalServerError({
    cause: error,
  });

  console.error(publicErrorObject);
  return res.status(publicErrorObject.statusCode).json(publicErrorObject);
};

const controller = {
  errorHandler: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
};

export default controller;
