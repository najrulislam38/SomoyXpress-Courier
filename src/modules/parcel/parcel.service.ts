import { User } from "../user/user.model";
// import { IUser, UserRole } from "../user/user.interface";
import AppError from "../../errorHelpers/AppError";
import mongoose from "mongoose";
import { IStatusLog, ParcelStatus } from "./parcel.interface";
import { Parcel } from "./parcel.model";
import calculatePrice from "../../utils/calculatePrice";
import generateTrackingId from "../../utils/generateTrackingId";
import { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status-codes";
import { IUser, UserRole } from "../user/user.interface";
import { isValidStatusTransition } from "../../utils/statusChecker";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { Request } from "express";
import { parcelSearchableFields } from "./parcel.constant";

/* eslint-disable @typescript-eslint/no-explicit-any */
const createParcelFromDB = async (userId: string, payload: any) => {
  const {
    receiver,
    // recipientName,
    // recipientPhone,
    // recipientAddress,
    pickupAddress,
    deliveryAddress,
    weight,
    amountCollect,
    location,
    ...parcelData
  } = payload;

  const isRecipientExist = await User.findById(receiver);

  //   if (!isRecipientExist) {
  //     const recipientPayload: IUser = {
  //       name: recipientName,
  //       email: receiverEmail,
  //       phone: recipientPhone,
  //       address: recipientAddress,
  //       role: UserRole.RECEIVER,
  //       auths: [
  //         {
  //           provider: "on_hand",
  //           providerId: receiverEmail,
  //         },
  //       ],
  //     };

  //     await User.create(recipientPayload);
  //   }

  if (!isRecipientExist) {
    throw new AppError(404, `There is no receiver in this ${receiver}`);
  }

  if (isRecipientExist.role !== UserRole.RECEIVER) {
    throw new AppError(404, ` ${receiver} is not a Receiver`);
  }

  const senderData = await User.findById(userId);

  if (!senderData) {
    throw new AppError(400, "Sender not found");
  }

  // Generate tracking ID
  const trackingId = generateTrackingId();

  const deliveryFee = calculatePrice(weight, amountCollect);

  const parcelPayload = {
    trackingId,
    sender: new mongoose.Types.ObjectId(userId),
    receiver: new mongoose.Types.ObjectId(isRecipientExist._id),
    pickupAddress: pickupAddress,
    deliveryAddress: deliveryAddress,
    weight: weight,
    amountCollect,
    deliveryFee,
    description: parcelData.description,
    statusLogs: [
      {
        status: ParcelStatus.REQUESTED,
        location: location || pickupAddress,
        updatedBy: senderData._id,
        timestamp: new Date(),
        note: parcelData?.note,
      },
    ],
    expectedDeliveryDate: parcelData.expectedDeliveryDate,
  };

  const parcel = await Parcel.create(parcelPayload);

  return parcel;
};

const getAllParcel = async (
  decodedToken: JwtPayload,
  query: Record<string, string>
) => {
  if (!decodedToken) {
    throw new AppError(403, "This route not permitted for you");
  }

  let roleConditions: Record<string, unknown> = {};

  if (decodedToken.role === "SENDER") {
    roleConditions = { sender: decodedToken.userId };
  } else if (decodedToken.role === "RECEIVER") {
    roleConditions = { receiver: decodedToken.userId };
  } else if (
    decodedToken.role !== "ADMIN" &&
    decodedToken.role !== "SUPER_ADMIN"
  ) {
    throw new AppError(403, "Unauthorized role");
  }

  const queryBuilder = new QueryBuilder(
    Parcel.find(roleConditions).populate("sender").populate("receiver"),
    query
  )
    .filter()
    .search(parcelSearchableFields)
    .sort()
    .fields()
    .paginate();

  const parcels = await queryBuilder.build();

  const meta = await queryBuilder.getMeta(roleConditions);

  return {
    data: parcels,
    meta,
  };
};

const getSingleParcel = async (parcelId: string, decodedToken: JwtPayload) => {
  const parcel = await Parcel.findById(parcelId)
    .populate("sender")
    .populate("receiver");

  if (!parcel) {
    throw new AppError(httpStatus.BAD_REQUEST, "Parcel Not Found.");
  }

  if (decodedToken.role === "ADMIN" || decodedToken.role === "SUPER_ADMIN") {
    return parcel;
  }

  const sender =
    parcel.sender && typeof parcel.sender === "object" && "_id" in parcel.sender
      ? (parcel.sender as unknown as IUser)
      : undefined;
  const receiver =
    parcel.receiver &&
    typeof parcel.receiver === "object" &&
    "_id" in parcel.receiver
      ? (parcel.receiver as unknown as IUser)
      : undefined;

  if (!sender || !receiver) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Sender or Receiver information is missing."
    );
  }

  const senderId = sender._id?.toString() ?? "";
  const receiverId = receiver._id?.toString() ?? "";

  if (
    decodedToken.role !== "ADMIN" &&
    decodedToken.role !== "SUPER_ADMIN" &&
    senderId !== decodedToken.userId &&
    receiverId !== decodedToken.userId
  ) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized access. You con't get single parcel"
    );
  }

  return parcel;
};

const updateStatusFromDB = async (
  parcelId: string,
  decodedToken: JwtPayload,
  payload: Partial<IStatusLog>
) => {
  const { status, location, note } = payload;

  const parcel = await Parcel.findById(parcelId);

  if (!parcel) {
    throw new AppError(httpStatus.BAD_REQUEST, "Parcel Not Found");
  }

  if (
    decodedToken.role !== UserRole.ADMIN &&
    decodedToken.role !== UserRole.SUPER_ADMIN
  ) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized access. You con't update parcel status"
    );
  }

  if (!status) {
    throw new AppError(400, "You can provide parcel new status");
  }

  if (!isValidStatusTransition(parcel.currentStatus, status)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid status transition");
  }

  const statusLog: IStatusLog = {
    status,
    location: location || parcel.deliveryAddress,
    timestamp: new Date(),
    updatedBy: decodedToken.userId,
    note: note || `Status updated to ${status}`,
  };

  parcel.currentStatus = status;
  parcel.statusLogs.push(statusLog);

  if (status === ParcelStatus.DELIVERED) {
    parcel.actualDeliveryDate = new Date();
  }

  await parcel.save();

  return parcel;
};

const cancelParcelFromDB = async (
  parcelId: string,
  decodedToken: JwtPayload
) => {
  const parcel = await Parcel.findById(parcelId);

  if (!parcel) {
    throw new AppError(httpStatus.BAD_REQUEST, "Parcel Not Found.");
  }

  if (
    decodedToken.role !== UserRole.ADMIN &&
    decodedToken.role !== UserRole.SUPER_ADMIN &&
    parcel.sender.toString() !== decodedToken.userId
  ) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized access form cancel parcel"
    );
  }

  if (
    parcel.currentStatus !== ParcelStatus.REQUESTED &&
    parcel.currentStatus !== ParcelStatus.APPROVED
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Parcel cannot be cancelled at this stage"
    );
  }

  const statusLogs: IStatusLog = {
    status: ParcelStatus.CANCELLED,
    location: parcel.pickupAddress,
    timestamp: new Date(),
    updatedBy: decodedToken.useId,
    note: "Parcel Cancelled.",
  };

  parcel.currentStatus = ParcelStatus.CANCELLED;
  parcel.statusLogs.push(statusLogs);
  await parcel.save();

  return parcel;
};

const confirmParcelFromDB = async (
  parcelId: string,
  decodedToken: JwtPayload
) => {
  const parcel = await Parcel.findById(parcelId);

  if (!parcel) {
    throw new AppError(httpStatus.BAD_REQUEST, "Parcel Not Found.");
  }

  if (parcel.receiver.toString() !== decodedToken.userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized Access");
  }

  if (parcel.currentStatus === ParcelStatus.DELIVERED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Already Parcel delivery confirmed"
    );
  }

  const statusLog: IStatusLog = {
    status: ParcelStatus.DELIVERED,
    location: parcel.deliveryAddress,
    timestamp: new Date(),
    updatedBy: decodedToken.useId,
    note: `Delivery confirmed by ${decodedToken.email}`,
  };

  parcel.currentStatus = ParcelStatus.DELIVERED;
  parcel.statusLogs.push(statusLog);
  await parcel.save();

  return parcel;
};

const getIncomingParcelFromDB = async (
  req: Request,
  decodedToken: JwtPayload
) => {
  const queryObj = { ...req.query, receiver: decodedToken?.userId };

  const queryBuilder = new QueryBuilder(
    Parcel.find().populate("sender", "name email phone"),
    queryObj
  );

  const modelQuery = queryBuilder
    .filter()
    .search(["trackingId", "pickupAddress", "deliveryAddress"])
    .sort()
    .fields()
    .paginate()
    .build();

  const parcels = await modelQuery;

  const meta = await queryBuilder.getMeta();

  return {
    data: parcels,
    meta,
  };
};

const getParcelDeliveryHistoryFromDB = async (
  req: Request,
  decodedToken: JwtPayload
) => {
  const queryObj: Record<string, any> = {
    ...req.query,
    receiver: decodedToken?.userId,
    currentStatus: {
      $in: [
        ParcelStatus.DELIVERED,
        ParcelStatus.CANCELLED,
        ParcelStatus.RETURNED,
      ],
    },
  };

  const queryBuilder = new QueryBuilder(
    Parcel.find().populate("sender", "name email phone"),
    queryObj
  );

  const modelQuery = queryBuilder
    .filter()
    .search(["trackingId", "pickupAddress", "deliveryAddress"])
    .sort()
    .fields()
    .paginate()
    .build();

  const parcels = await modelQuery;

  const meta = await queryBuilder.getMeta();

  return {
    data: parcels,
    meta,
  };
};

const deleteParcelFromDB = async (
  parcelId: string,
  decodedToken: JwtPayload
) => {
  const parcel = await Parcel.findById(parcelId);

  if (!parcel) {
    throw new AppError(httpStatus.BAD_REQUEST, "Parcel Not Found.");
  }

  if (
    decodedToken.role !== UserRole.ADMIN &&
    decodedToken.role !== UserRole.SUPER_ADMIN &&
    decodedToken.userId !== parcel.sender.toString()
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized Access");
  }

  if (
    parcel.currentStatus !== ParcelStatus.REQUESTED &&
    parcel.currentStatus !== ParcelStatus.APPROVED &&
    parcel.currentStatus !== ParcelStatus.CANCELLED
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `This Parcel con't deleted in this state ${parcel.currentStatus}`
    );
  }

  const deletedParcel = await Parcel.findByIdAndDelete(parcelId);

  return deletedParcel;
};

const parcelTrackingFromDB = async (trackingId: string) => {
  const parcel = await Parcel.findOne({ trackingId: trackingId });

  if (!parcel) {
    throw new AppError(httpStatus.BAD_REQUEST, "Parcel Not Found.");
  }

  const trackingInfo = {
    trackingId: parcel.trackingId,
    currentStatus: parcel.currentStatus,
    statusLogs: parcel.statusLogs.map((track) => ({
      status: track.status,
      timeStamp: track.timestamp,
      location: track.location,
      note: track.note,
    })),
    expectedDeliveryDate: parcel.expectedDeliveryDate,
  };

  return trackingInfo;
};

export const ParcelServices = {
  createParcelFromDB,
  getAllParcel,
  getSingleParcel,
  updateStatusFromDB,
  confirmParcelFromDB,
  cancelParcelFromDB,
  parcelTrackingFromDB,
  deleteParcelFromDB,
  getIncomingParcelFromDB,
  getParcelDeliveryHistoryFromDB,
};
