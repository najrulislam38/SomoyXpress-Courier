import { Schema } from "mongoose";

export enum ParcelStatus {
  REQUESTED = "REQUESTED",
  APPROVED = "APPROVED",
  PICKED = "PICKED",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  RETURNED = "RETURNED",
}

export enum DeliveryType {
  Normal_Delivery = "Normal Delivery",
  Hub_Delivery = "Hub Delivery",
}

export interface IStatusLog {
  status: ParcelStatus;
  location: string;
  timestamp: Date;
  updatedBy: string;
  specialInstructions?: string;
}

export interface IParcel {
  trackingId: string;
  sender: Schema.Types.ObjectId;
  receiver: Schema.Types.ObjectId;
  pickupAddress: string;
  deliveryAddress: string;
  weight: number;
  price: number;
  description?: string;
  currentStatus: ParcelStatus;
  deliveryTypes: DeliveryType;
  statusLogs: IStatusLog[];
  isBlocked: boolean;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
}
