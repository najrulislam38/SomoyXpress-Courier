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
    const result = await UserServices.getAllUserFromDB(
      req.query as Record<string, string>
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Users Retrieved Successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getAllReceiver = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices.getAllReceiverFromDB(
      req.query as Record<string, string>
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Receiver Retrieved Successfully",
      meta: result.meta,
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
      message: "User Profile Retrieved Successfully",

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
    const decodedToken = req.user as JwtPayload;
    const result = await UserServices.updateUserFromDB(
      userId,
      updateInformation,
      decodedToken
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User Data Updated Successfully",
      data: result,
    });
  }
);

const blockUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const decodedToken = req.user as JwtPayload;
    const result = await UserServices.blockUserFromDB(userId, decodedToken);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User Blocked Successfully",
      data: result,
    });
  }
);

const DeleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const decodedToken = req.user as JwtPayload;
    const result = await UserServices.deleteUserFromDB(userId, decodedToken);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User Deleted Successfully",
      data: result,
    });
  }
);

const unBlockUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const decodedToken = req.user as JwtPayload;
    const result = await UserServices.unBlockUserFromDB(userId, decodedToken);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User Blocked Successfully",
      data: result,
    });
  }
);

export const UserController = {
  createUser,
  getAllUsers,
  getAllReceiver,
  getMe,
  updateMe,
  getSingleUser,
  updateUser,
  blockUser,
  unBlockUser,
  DeleteUser,
};
