import { User } from "../user/user.model";
// import { IUser, UserRole } from "../user/user.interface";
import AppError from "../../errorHelpers/AppError";
import crypto from "crypto";
import mongoose from "mongoose";
import { ParcelStatus } from "./parcel.interface";
import { Parcel } from "./parcel.model";

function calculatePrice(weight: number): number {
  const basePrice = 50;
  const perKgPrice = 20;
  return basePrice + Number(weight) * perKgPrice;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const createParcelFromDB = async (userId: string, payload: any) => {
  const {
    recipientEmail,
    // recipientName,
    // recipientPhone,
    // recipientAddress,
    ...parcelData
  } = payload;

  console.log(userId);

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
  const trackingId = `TRK-${new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "")}-${crypto.randomBytes(8).toString("hex")}`;

  const price = calculatePrice(parcelData.weight);

  const parcelPayload = {
    trackingId,
    sender: new mongoose.Types.ObjectId(userId),
    receiver: new mongoose.Types.ObjectId(isRecipientExist._id),
    pickupAddress: parcelData.pickupAddress,
    deliveryAddress: parcelData.deliveryAddress,
    weight: parcelData.weight,
    price,
    statusLogs: [
      {
        status: ParcelStatus.REQUESTED,
        location: parcelData.location,
        updatedBy: senderData.email,
      },
    ],
  };

  const parcel = await Parcel.create(parcelPayload);

  return parcel;
};

export const ParcelServices = { createParcelFromDB };
