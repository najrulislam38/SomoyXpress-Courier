import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import { envVariables } from "../config/env";
import { JwtPayload } from "jsonwebtoken";
import { verifiedToken } from "../utils/jwt";
import { User } from "../modules/user/user.model";
import httpStatus from "http-status-codes";

export const withAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.headers.authorization || req.cookies.accessToken;

      if (!accessToken) {
        throw new AppError(403, "No token found!");
      }

      const verifyToken = verifiedToken(
        accessToken,
        envVariables.JWT_ACCESS_SECRET
      ) as JwtPayload;

      const isUserExist = await User.findOne({ email: verifyToken.email });

      if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User Not Exist");
      }

      if (isUserExist.isBlocked) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is Blocked");
      }

      if (isUserExist.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");
      }

      if (!authRoles.includes(verifyToken.role)) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "You are not permitted view this route."
        );
      }
      req.user = verifyToken;

      next();
    } catch (error) {
      next(error);
    }
  };
