import { model, Schema } from "mongoose";
import { DeliveryType, IParcel, ParcelStatus } from "./parcel.interface";

const parcelSchema = new Schema<IParcel>(
  {
    trackingId: { type: String, required: true, unique: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pickupAddress: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    weight: { type: Number, required: true, min: 0.1 },
    amountCollect: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    description: { type: String },
    currentStatus: {
      type: String,
      enum: Object.values(ParcelStatus),
      default: ParcelStatus.REQUESTED,
    },
    deliveryTypes: {
      type: String,
      enum: Object.values(DeliveryType),
      default: DeliveryType.Normal_Delivery,
    },
    statusLogs: [
      {
        status: {
          type: String,
          enum: Object.values(ParcelStatus),
          required: true,
        },
        location: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        updatedBy: { type: [String], default: [] },
        specialInstructions: { type: String },
      },
    ],
    isBlocked: { type: Boolean, default: false },
    expectedDeliveryDate: { type: Date },
    actualDeliveryDate: { type: Date },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const Parcel = model<IParcel>("Parcel", parcelSchema);
