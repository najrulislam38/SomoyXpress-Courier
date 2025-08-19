/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import passport from "passport";
import { createUserToken } from "../../utils/userTokens";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { AuthServices } from "./auth.sevice";

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

    res.cookie("accessToken", userTokens.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.cookie("refreshToken", userTokens.refreshToken, {
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

const logout = async (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Logged out successfully",
    data: null,
  });
};

const getNewAccessTokenUseRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError(httpStatus.BAD_REQUEST, "No refresh token have cookies");
  }

  const tokenInfo = await AuthServices.getNewAccessTokenUseRefreshToken(
    refreshToken
  );

  res.cookie("accessToken", tokenInfo.accessToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "New Access token retrieved successfully.",
    data: tokenInfo,
  });
};

export const AuthController = {
  credentialLogin,
  logout,
  getNewAccessTokenUseRefreshToken,
};
