import { User } from "../user/user.model";
// import { IUser, UserRole } from "../user/user.interface";
import AppError from "../../errorHelpers/AppError";
import mongoose from "mongoose";
import { ParcelStatus } from "./parcel.interface";
import { Parcel } from "./parcel.model";
import calculatePrice from "../../utils/calculatePrice";
import generateTrackingId from "../../utils/generateTrackingId";
import { JwtPayload } from "jsonwebtoken";

/* eslint-disable @typescript-eslint/no-explicit-any */
const createParcelFromDB = async (userId: string, payload: any) => {
  const {
    recipientEmail,
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
    email: recipientEmail,
    role: "RECEIVER",
  });

  //   if (!isRecipientExist) {
  //     const recipientPayload: IUser = {
  //       name: recipientName,
  //       email: recipientEmail,
  //       phone: recipientPhone,
  //       address: recipientAddress,
  //       role: UserRole.RECEIVER,
  //       auths: [
  //         {
  //           provider: "on_hand",
  //           providerId: recipientEmail,
  //         },
  //       ],
  //     };

  //     await User.create(recipientPayload);
  //   }

  if (!isRecipientExist) {
    throw new AppError(404, `There is no receiver in this ${recipientEmail}`);
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
        specialInstructions: parcelData.specialInstructions,
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
    totalParcel = await Parcel.countDocuments({ sender: decodedToken.userId });
  } else if (decodedToken.role === "RECEIVER") {
    parcels = await Parcel.find({ receiver: decodedToken.userId });
    totalParcel = await Parcel.countDocuments({
      receiver: decodedToken.userId,
    });
  } else if (
    decodedToken.role === "ADMIN" ||
    decodedToken.role === "SUPER_ADMIN"
  ) {
    parcels = await Parcel.find();
    totalParcel = await Parcel.countDocuments();
  }

  return {
    data: parcels,
    meta: totalParcel,
  };
};

export const ParcelServices = { createParcelFromDB, getAllParcel };
