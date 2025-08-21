/* eslint-disable @typescript-eslint/no-unused-vars */
import { IAuthProvider, IUser } from "./user.interface";
import bcryptjs from "bcryptjs";
import { User } from "./user.model";
import { envVariables } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

const createUserDB = async (payload: Partial<IUser>) => {
  const { email, password, phone, ...rest } = payload;

  const hashPass = await bcryptjs.hash(
    password as string,
    Number(envVariables.BCRYPT_SALT_ROUND)
  );

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };

  const user = await User.create({
    email,
    password: hashPass,
    phone,
    auths: [authProvider],
    ...rest,
  });
  return user;
};

const getAllUserFromDB = async () => {
  const users = await User.find().select("-password");
  const totalUser = await User.countDocuments();

  return {
    data: users,
    meta: totalUser,
  };
};

const getMeFromDB = async (decodedToken: JwtPayload) => {
  const userId = decodedToken.userId;
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "User not found");
  }

  const { password: pass, ...userInfo } = user.toObject();

  return userInfo;
};

const updateMeFromDB = async (
  decodedToken: JwtPayload,
  payload: Partial<IUser>
) => {
  const user = await User.findById(decodedToken.userId);
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "User not found");
  }

  if (user === payload) {
    throw new AppError(httpStatus.BAD_REQUEST, "Already Updated");
  }

  const updatedMe = await User.findByIdAndUpdate(user._id, payload, {
    new: true,
    runValidators: true,
    select: "-password",
  });

  return updatedMe;
};

const getSingleUserFromDB = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "User not found");
  }

  return user;
};

const updateUser = async (userId: string, payload: Partial<IUser>) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  const updatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
    select: "-password",
  });

  return updatedUser;
};

export const UserServices = {
  createUserDB,
  getAllUserFromDB,
  getMeFromDB,
  updateMeFromDB,
  getSingleUserFromDB,
  updateUser,
};
