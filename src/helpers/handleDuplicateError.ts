/* eslint-disable @typescript-eslint/no-explicit-any */

import { IGenericErrorResponse } from "../interfaces/error.types";

export const handleDuplicateError = (err: any): IGenericErrorResponse => {
  const matchedEmail = err.message.match(/"([^"]*)"/);
  return {
    statusCode: 400,
    message: `${matchedEmail[1]} is already exists.`,
  };
};
