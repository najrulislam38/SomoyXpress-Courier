/* eslint-disable @typescript-eslint/no-unused-vars */
import { IAuthProvider, IUser, UserRole } from "./user.interface";
import bcryptjs from "bcryptjs";
import { User } from "./user.model";
import { envVariables } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { userSearchableFields } from "./user.constant";
import { QueryBuilder } from "../../utils/QueryBuilder";

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

const getAllUserFromDB = async (query: Record<string, string>) => {
  const userQuery = new QueryBuilder(User.find(), query || {})
    .search(userSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const users = await userQuery.build().select("-password");
  const meta = await userQuery.getMeta();

  return {
    data: users,
    meta,
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
const deleteUserFromDB = async (userId: string, decodedToken: JwtPayload) => {
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

  if (isUserExist.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Already Deleted");
  }

  const deletedUser = await User.findByIdAndUpdate(
    userId,
    { isDeleted: true },
    {
      new: true,
      select: "-password",
    }
  );

  return deletedUser;
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
  deleteUserFromDB,
};
