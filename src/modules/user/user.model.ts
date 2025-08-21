import { model, Schema } from "mongoose";
import { IAuthProvider, IUser, UserRole } from "./user.interface";

// users auth schema
export const userAuthSchema = new Schema<IAuthProvider>(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
  },
  {
    _id: false,
    versionKey: false,
  }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phone: { type: String, required: true },
    age: { type: Number },
    gender: { type: String },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    picture: { type: String },
    address: { type: String },
    isBlocked: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    auths: [userAuthSchema],
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const User = model<IUser>("User", userSchema);
