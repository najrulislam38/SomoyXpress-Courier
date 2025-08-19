/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { UserServices } from "./user.servise";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const user = await UserServices.createUserDB(req.body);

  if (!user) {
    throw new Error("Something wrong!");
  }

  const { password, ...userInfo } = user.toObject();

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User Created Successfully",
    data: userInfo,
  });
};

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  const result = await UserServices.getAllUserFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users Retrieved Successfully",
    meta: {
      total: result.meta,
    },
    data: result.data,
  });
};

export const UserController = {
  createUser,
  getAllUsers,
};
