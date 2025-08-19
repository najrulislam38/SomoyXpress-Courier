/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { envVariables } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { IErrorSources } from "../interfaces/error.types";
import { handleDuplicateError } from "../helpers/handleDuplicateError";
import { handleCastError } from "../helpers/handleCastError";
import { handleValidationError } from "../helpers/handleValidationError";
import { handleZodError } from "../helpers/handleZodError";

export const globalErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = "Something went wrong!";

  let errorSources: IErrorSources[] = [
    // {
    //   path: "",
    //   message: ""
    // }
  ];
  if (err.code === 11000) {
    const duplicateError = handleDuplicateError(err);
    statusCode = duplicateError.statusCode;
    message = duplicateError.message;
  } else if (err.name === "CastError") {
    const castError = handleCastError(err);
    statusCode = castError.statusCode;
    message = castError.message;
  } else if (err.name === "ValidationError") {
    const validationError = handleValidationError(err);
    statusCode = validationError.statusCode;
    message = validationError.message;
    errorSources = validationError?.errorSources as IErrorSources[];
  } else if (err.name === "ZodError") {
    const zodError = handleZodError(err);
    statusCode = zodError.statusCode;
    message = zodError.message;
    errorSources = zodError?.errorSources as IErrorSources[];
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    statusCode = 500;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    err: envVariables.NODE_ENV === "development" ? err : null,
    stack: envVariables.NODE_ENV === "development" ? err.stack : null,
  });
};
