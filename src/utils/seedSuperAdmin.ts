/* eslint-disable no-console */
import { envVariables } from "../config/env";
import { IAuthProvider, IUser, UserRole } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import bcryptjs from "bcryptjs";

export const seedSuperAdmin = async () => {
  try {
    const isExistSuperAdmin = await User.findOne({
      email: envVariables.SUPER_ADMIN_EMAIL,
    });

    if (isExistSuperAdmin) {
      console.log("Super Admin already existed");
      return;
    }

    const authProvider: IAuthProvider = {
      provider: "credentials",
      providerId: envVariables.SUPER_ADMIN_EMAIL,
    };

    const hashPassword = await bcryptjs.hash(
      envVariables.SUPER_ADMIN_PASSWORD,
      Number(envVariables.BCRYPT_SALT_ROUND)
    );

    console.log("Super Admin Creating.");

    const adminPayload: IUser = {
      name: "Super Admin",
      role: UserRole.SUPER_ADMIN,
      phone: "01761954738",
      email: envVariables.SUPER_ADMIN_EMAIL,
      address: "Kalai",
      isVerified: true,
      password: hashPassword,
      auths: [authProvider],
    };

    const superAmin = await User.create(adminPayload);

    if (envVariables.NODE_ENV === "development") {
      console.log(superAmin);
    }

    console.log("Super Admin Created Successfully.");
  } catch (error) {
    console.log(error);
  }
};
