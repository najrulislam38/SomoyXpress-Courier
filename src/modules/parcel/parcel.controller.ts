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

const confirmParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parcelId = req.params.id;
    const decodedToken = req.user as JwtPayload;

    const result = await ParcelServices.confirmParcelFromDB(
      parcelId,
      decodedToken
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Parcel Delivery Successfully",
      data: result,
    });
  }
);

const getIncomingParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;

    const result = await ParcelServices.getIncomingParcelFromDB(
      req,
      decodedToken
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Parcel Delivery Successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getParcelDeliveryHistory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parcelId = req.params.id;
    const decodedToken = req.user as JwtPayload;

    const result = await ParcelServices.getParcelDeliveryHistoryFromDB(
      req,
      decodedToken
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Parcel Delivery Successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const parcelTracking = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const trackingId = req.params.trackingId;

    const result = await ParcelServices.parcelTrackingFromDB(trackingId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Parcel Tracking Successfully",
      data: result,
    });
  }
);

const deleteParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parcelId = req.params.id;
    const decodedToken = req.user as JwtPayload;

    const result = await ParcelServices.deleteParcelFromDB(
      parcelId,
      decodedToken
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Parcel Deleted Successfully",
      data: null,
    });
  }
);

export const ParcelController = {
  createParcel,
  getAllParcel,
  getSingleParcel,
  updateParcelStatus,
  cancelParcel,
  confirmParcel,
  parcelTracking,
  deleteParcel,
  getIncomingParcel,
  getParcelDeliveryHistory,
};
