import { Types } from "mongoose";

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  SENDER = "SENDER",
  RECEIVER = "RECEIVER",
}

export interface IAuthProvider {
  provider: "google" | "credentials" | "on_hand";
  providerId: string;
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  age?: number;
  gender?: "Male" | "Female" | "Others";
  password?: string;
  role: UserRole;
  phone: string;
  address?: string;
  isBlocked?: boolean;
  auths: IAuthProvider[];
  picture?: string;
  isDeleted?: boolean;
  isVerified?: boolean;
}
