import { IAuthProvider, IUser } from "./user.interface";
import bcryptjs from "bcryptjs";
import { User } from "./user.model";
import { envVariables } from "../../config/env";

const createUserDB = async (payload: Partial<IUser>) => {
  const { email, password, phone, ...rest } = payload;

  const hashPass = await bcryptjs.hash(
    password as string,
    Number(envVariables.BCRYPT_SALT_ROUND)
  );

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };

  const user = await User.create({
    email,
    password: hashPass,
    phone,
    auths: [authProvider],
    ...rest,
  });
  return user;
};

const getAllUserFromDB = async () => {
  const users = await User.find();
  const totalUser = await User.countDocuments();

  return {
    data: users,
    meta: totalUser,
  };
};

const getSingleUserFromDB = async (userId: string) => {
  const user = await User.findById(userId);

  return user;
};

const updateUser = async (userId: string) => {
  const updateUserInfo = {
    name: "Rahim",
  };
  const user = await User.findByIdAndUpdate(userId, updateUserInfo, {
    new: true,
    runValidators: true,
  });

  return user;
};

export const UserServices = {
  createUserDB,
  getAllUserFromDB,
  getSingleUserFromDB,
  updateUser,
};
