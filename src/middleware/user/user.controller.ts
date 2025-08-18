/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { UserServices } from "./user.servise";
import { sendResponse } from "../../utils/sendResponse";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const user = await UserServices.createUserDB(req.body);
  console.log(user);

  if (!user) {
    throw new Error("Something wrong!");
  }

  const { password, ...userInfo } = user.toObject();

  // res.status(200).send({
  //   success: true,
  //   message: "User Created Successfully",
  //   data: userInfo,
  // });
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User Created Successfully",
    data: userInfo,
  });
};

// const createUser = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const user = await UserServices.createUserDB(req.body);
//     console.log(user);

//     if (!user) {
//       throw new Error("Something wrong!");
//     }

//     res.status(200).send({
//       success: true,
//       message: "User Created Successful",
//       data: user,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(400).send({
//       success: false,
//       message: "User Created failed",
//       error,
//     });
//   }
// };

export const UserController = {
  createUser,
};
