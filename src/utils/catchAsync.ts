/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { envVariables } from "../config/env";

type TCatchAsync = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const catchAsync =
  (fnc: TCatchAsync) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fnc(req, res, next)).catch((error: any) => {
      if (envVariables.NODE_ENV === "development") {
        console.log(error);
      }
      next(error);
    });
  };
