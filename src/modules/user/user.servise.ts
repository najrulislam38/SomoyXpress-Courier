/* eslint-disable @typescript-eslint/no-unused-vars */
import { IAuthProvider, IUser, UserRole } from "./user.interface";
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

const updateUserFromDB = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
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

const blockUserFromDB = async (userId: string, decodedToken: JwtPayload) => {
  const isUserExist = await User.findById(userId);

  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  if (
    decodedToken.role === UserRole.ADMIN &&
    isUserExist.role === UserRole.SUPER_ADMIN
  ) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
  }

  if (isUserExist.isBlocked) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Already Blocked");
  }

  const blockUser = await User.findByIdAndUpdate(
    userId,
    { isBlocked: true },
    {
      new: true,
      select: "-password",
    }
  );

  return blockUser;
};

const unBlockUserFromDB = async (userId: string, decodedToken: JwtPayload) => {
  const isUserExist = await User.findById(userId);

  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  if (
    decodedToken.role === UserRole.ADMIN &&
    isUserExist.role === UserRole.SUPER_ADMIN
  ) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
  }

  if (!isUserExist.isBlocked) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Already unblocked");
  }

  const unblockUser = await User.findByIdAndUpdate(
    userId,
    { isBlocked: false },
    {
      new: true,
      select: "-password",
    }
  );

  return unblockUser;
};

export const UserServices = {
  createUserDB,
  getAllUserFromDB,
  getMeFromDB,
  updateMeFromDB,
  getSingleUserFromDB,
  updateUserFromDB,
  blockUserFromDB,
  unBlockUserFromDB,
};
