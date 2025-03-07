import { InternalServerError, MethodNotAllowedError } from "infra/errors.js";

const onNoMatchHandler = async (_req, res) => {
  const errorObject = new MethodNotAllowedError();
  return res.status(errorObject.statusCode).json(errorObject);
};

const onErrorHandler = async (error, _req, res) => {
  const publicErrorObject = new InternalServerError({
    statusCode: error.statusCode,
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
