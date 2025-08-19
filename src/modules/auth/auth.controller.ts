/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import passport from "passport";
import { createUserToken } from "../../utils/userTokens";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";

const credentialLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate("local", async (error: any, user: any, info: any) => {
    if (error) {
      return next(new AppError(401, error));
    }
    if (!user) {
      return next(new AppError(401, info.message || "UnAuthorized Access"));
    }

    const userTokens = await createUserToken(user);

    res.cookie("accessToken", userTokens, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    const { password: pass, ...rest } = user.toObject();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User Logged in successfully",
      data: {
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        user: rest,
      },
    });
  })(req, res, next);
};

export const AuthController = { credentialLogin };
