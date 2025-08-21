/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { UserServices } from "./user.servise";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
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
  }
);

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
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
  }
);

const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const result = await UserServices.getMeFromDB(decodedToken);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Request Updated Successfully",

      data: result,
    });
  }
);

const updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const decodedToken = req.user as JwtPayload;
    const result = await UserServices.updateMeFromDB(decodedToken, payload);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User Retrieved Successfully",

      data: result,
    });
  }
);

const getSingleUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    // const decodedToken = req.user as JwtPayload;
    const result = await UserServices.getSingleUserFromDB(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User Retrieved Successfully",

      data: result,
    });
  }
);

const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const updateInformation = req.body;
    const result = await UserServices.updateUser(userId, updateInformation);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User Data Updated Successfully",

      data: result,
    });
  }
);

export const UserController = {
  createUser,
  getAllUsers,
  getMe,
  updateMe,
  getSingleUser,
  updateUser,
};
