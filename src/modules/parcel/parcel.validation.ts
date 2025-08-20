import { z } from "zod";
import { DeliveryType, ParcelStatus } from "./parcel.interface";

const statusLogZodSchema = z.object({
  status: z.enum([
    Object.values(ParcelStatus)[0],
    ...Object.values(ParcelStatus).slice(1),
  ] as [string, ...string[]]),
  location: z.string(),
  timestamp: z
    .date()
    .optional()
    .default(() => new Date()),
  updatedBy: z.string().optional(),
  specialInstructions: z.string().optional(),
});

export const crateParcelZodSchema = z.object({
  receiverEmail: z.email(),
  pickupAddress: z.string(),
  deliveryAddress: z.string(),
  weight: z
    .number()
    .positive("Weight must be positive")
    .min(0.1, "Weight must be at least 0.1"),
  amountCollect: z
    .number()
    .nonnegative("Collection cannot be negative")
    .min(0, "Collection cannot be negative"),
  description: z.string().optional(),
  currentStatus: z
    .enum([
      Object.values(ParcelStatus)[0],
      ...Object.values(ParcelStatus).slice(1),
    ] as [string, ...string[]])
    .default(ParcelStatus.REQUESTED),
  deliveryTypes: z
    .enum([
      Object.values(DeliveryType)[0],
      ...Object.values(DeliveryType).slice(1),
    ] as [string, ...string[]])
    .default(DeliveryType.Normal_Delivery),
  statusLogs: z.array(statusLogZodSchema).default([]),
  isBlocked: z.boolean().default(false),
  expectedDeliveryDate: z.date().optional(),
  actualDeliveryDate: z.date().optional(),
});
