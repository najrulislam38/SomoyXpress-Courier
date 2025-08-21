import { JwtPayload } from "jsonwebtoken";
import { envVariables } from "../../config/env";
import { generateToken, verifiedToken } from "../../utils/jwt";
import { User } from "../user/user.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";

const getNewAccessTokenUseRefreshToken = async (refreshToken: string) => {
  const verifiedRefreshToken = verifiedToken(
    refreshToken,
    envVariables.JWT_REFRESH_SECRET
  ) as JwtPayload;

  const isUserExist = await User.findOne({ email: verifiedRefreshToken.email });

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User not exist.");
  }

  if (isUserExist.isBlocked) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is Blocked");
  }

  if (isUserExist.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is Deleted");
  }

  const jwtPayload = {
    userId: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role,
  };

  const newAccessToken = generateToken(
    jwtPayload,
    envVariables.JWT_ACCESS_SECRET,
    envVariables.JWT_ACCESS_EXPIRES
  );

  return {
    accessToken: newAccessToken,
  };
};

export const AuthServices = {
  getNewAccessTokenUseRefreshToken,
};
