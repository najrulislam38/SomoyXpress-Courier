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
import { UserRole } from "../user/user.interface";
import { isValidStatusTransition } from "../../utils/statusChecker";

/* eslint-disable @typescript-eslint/no-explicit-any */
const createParcelFromDB = async (userId: string, payload: any) => {
  const {
    receiverEmail,
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

  const isRecipientExist = await User.findOne({
    email: receiverEmail,
    role: "RECEIVER",
  });

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
    throw new AppError(404, `There is no receiver in this ${receiverEmail}`);
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
        updatedBy: senderData.email,
        timestamp: new Date(),
        note: parcelData.note,
      },
    ],
    expectedDeliveryDate: parcelData.expectedDeliveryDate,
  };

  const parcel = await Parcel.create(parcelPayload);

  return parcel;
};

const getAllParcel = async (decodedToken: JwtPayload) => {
  if (!decodedToken) {
    throw new AppError(403, "This route not permitted for you");
  }

  let parcels;

  let totalParcel;

  if (decodedToken.role === "SENDER") {
    parcels = await Parcel.find({ sender: decodedToken.userId });
    totalParcel = await Parcel.countDocuments({ sender: decodedToken.userId })
      .populate("sender")
      .populate("receiver");
  } else if (decodedToken.role === "RECEIVER") {
    parcels = await Parcel.find({ receiver: decodedToken.userId })
      .populate("sender")
      .populate("receiver");
    totalParcel = await Parcel.countDocuments({
      receiver: decodedToken.userId,
    });
  } else if (
    decodedToken.role === "ADMIN" ||
    decodedToken.role === "SUPER_ADMIN"
  ) {
    parcels = await Parcel.find().populate("sender").populate("receiver");
    totalParcel = await Parcel.countDocuments();
  }

  return {
    data: parcels,
    meta: totalParcel,
  };
};

const getSingleParcel = async (parcelId: string, decodedToken: JwtPayload) => {
  const parcel = await Parcel.findById(parcelId);

  if (!parcel) {
    throw new AppError(httpStatus.BAD_REQUEST, "Parcel Not Found.");
  }

  if (
    decodedToken.role !== "ADMIN" &&
    decodedToken.role !== "SUPER_ADMIN" &&
    parcel.sender.toString() !== decodedToken.userId &&
    parcel.receiver.toString() !== decodedToken.userId
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
    updatedBy: decodedToken.email,
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
    updatedBy: decodedToken.email,
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
    updatedBy: decodedToken.email,
    note: `Delivery confirmed by ${decodedToken.email}`,
  };

  parcel.currentStatus = ParcelStatus.DELIVERED;
  parcel.statusLogs.push(statusLog);
  await parcel.save();

  return parcel;
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

const parcelTrackingFromDB = async (
  trackingId: string,
  decodedToken: JwtPayload
) => {
  const parcel = await Parcel.findOne({ trackingId: trackingId });

  if (!parcel) {
    throw new AppError(httpStatus.BAD_REQUEST, "Parcel Not Found.");
  }

  if (parcel.receiver.toString() !== decodedToken.userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized Access");
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
};
