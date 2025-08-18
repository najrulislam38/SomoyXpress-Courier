import { envVariables } from "../config/env";
import { IUser } from "../modules/user/user.interface";
import jwt, { SignOptions } from "jsonwebtoken";

export const createUserToken = (user: Partial<IUser>) => {
  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(jwtPayload, envVariables.JWT_ACCESS_SECRET, {
    expiresIn: envVariables.JWT_ACCESS_EXPIRES,
  } as SignOptions);

  return accessToken;
};
