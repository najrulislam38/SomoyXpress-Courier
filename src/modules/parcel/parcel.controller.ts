/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { ParcelServices } from "./parcel.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

const createParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;

    const result = await ParcelServices.createParcelFromDB(
      decodedToken.userId,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User Data Updated Successfully",

      data: result,
    });
  }
);

const getAllParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;

    const result = await ParcelServices.getAllParcel(decodedToken);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User Data Updated Successfully",
      meta: {
        total: result.meta as number,
      },
      data: result.data,
    });
  }
);

export const ParcelController = {
  createParcel,
  getAllParcel,
};
