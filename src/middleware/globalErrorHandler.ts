/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { envVariables } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { IErrorSources } from "../interfaces/error.typs";

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
    //   stack: ""
    // }
  ];
  if (err.code === 11000) {
    const matchedEmail = err.message.match(/"([^"]*)"/);
    statusCode = 400;
    message = `${matchedEmail[1]} is already exists.`;
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid MongoDB Object. Please provide valid id";
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
  } else if (err.name === "ZodError") {
    statusCode = err.status;
    message = "Zod Error";
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
    err,
    stack: envVariables.NODE_ENV === "development" ? err.stack : null,
  });
};
