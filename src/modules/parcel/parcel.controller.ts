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
      message: "Parcel Created Successfully",

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
      message: "Parcels Retrieved Successfully",
      meta: {
        total: result.meta as number,
      },
      data: result.data,
    });
  }
);

const getSingleParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parcelId = req.params.id;
    const decodedToken = req.user as JwtPayload;

    const result = await ParcelServices.getSingleParcel(parcelId, decodedToken);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Parcel Retrieved Successfully",
      data: result,
    });
  }
);

const updateParcelStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parcelId = req.params.id;
    const payload = req.body;
    const decodedToken = req.user as JwtPayload;

    const result = await ParcelServices.updateStatusFromDB(
      parcelId,
      decodedToken,
      payload
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Parcel Status Updated Successfully",
      data: result,
    });
  }
);

const cancelParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parcelId = req.params.id;
    const decodedToken = req.user as JwtPayload;

    const result = await ParcelServices.cancelParcelFromDB(
      parcelId,
      decodedToken
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Parcel Canceled Successfully",
      data: result,
    });
  }
);

const deleteParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const parcelId = req.params.id;
    // const decodedToken = req.user as JwtPayload;

    // const result = await ParcelServices.getSingleParcel(parcelId, decodedToken);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Parcel Retrieved Successfully",
      data: result,
    });
  }
);

export const ParcelController = {
  createParcel,
  getAllParcel,
  getSingleParcel,
  updateParcelStatus,
  cancelParcel,
  deleteParcel,
};
