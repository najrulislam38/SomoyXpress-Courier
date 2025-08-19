import {
  IErrorSources,
  IGenericErrorResponse,
} from "../interfaces/error.types";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const handleZodError = (err: any): IGenericErrorResponse => {
  const errorSources: IErrorSources[] = [];

  err?.issues.forEach((issue: any) =>
    errorSources.push({
      path: issue.path[issue.path.length - 1],
      message: issue.message,
    })
  );
  return {
    statusCode: 400,
    message: "Zod Validation Error",
    errorSources,
  };
};
