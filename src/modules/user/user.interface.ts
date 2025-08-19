import { Types } from "mongoose";

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  SENDER = "SENDER",
  RECEIVER = "RECEIVER",
}

export interface IAuthProvider {
  provider: "google" | "credentials";
  providerId: string;
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  age: number;
  password: string;
  role: UserRole;
  phone: string;
  address?: string;
  isBlocked: boolean;
  auths: IAuthProvider[];
  picture?: string;
  isDeleted?: boolean;
  isVerified?: boolean;
}
